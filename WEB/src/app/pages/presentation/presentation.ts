// deno-lint-ignore-file no-sloppy-imports
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarCli } from "../../components/navbar-cli/navbar-cli";
import { FooterCli } from "../../components/footer-cli/footer-cli";
import { ListArquitecto, ListArquitectos } from '../../api/arquitectos/listArq';
import { servicesData, ServiciosOfrecidos } from './info.data';
import { ListProyectosView, ProyectoViewList } from '../../api/proyectos/list';
import { ActivatedRoute } from '@angular/router';
interface Value {
  icon: string;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  image: string;
  skills: string[];
  linkedin: string;
  email: string;
  whatsapp: string;
}

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.html',
  styleUrls: ['./presentation.css'],
  imports: [CommonModule, NavbarCli, FooterCli]
})
export class Presentation implements OnInit, OnDestroy {
  // Propiedades del componente
  isHeaderScrolled = false;
  currentSlide = 0;
  isMobileMenuActive = false;
  isBackToTopVisible = false;
  activeHeroSlide = 0;
  activeProjectIndex = 0;
  activeFilter = 'all';
  
  // Propiedades para el carrusel de equipo infinito
  currentTeamSlide = 0;
  teamSlideOffset = 0;
  cardsPerView = 3;
  teamIndicators: number[] = [];
  private autoSlideInterval: any;
  private isTransitioning = false;
  private readonly TRANSITION_DURATION = 500;

  listArq: ListArquitecto[] = [];
  listProy: ProyectoViewList[] = [];
  tamProy: number = 0;

  // Datos
  services: ServiciosOfrecidos[] =  servicesData;

  displayedProjects: ProyectoViewList[] = [];
  filteredProjects: ProyectoViewList[] = [];

  values: Value[] = [
    {
      icon: "bi bi-flower1",
      title: "Sostenibilidad",
      description: "Comprometidos con el medio ambiente y construcciones ecológicas"
    },
    {
      icon: "bi bi-lightbulb",
      title: "Innovación",
      description: "Soluciones creativas y tecnologías de vanguardia"
    },
    {
      icon: "bi bi-heart",
      title: "Pasión",
      description: "Amor por el diseño en cada detalle y proyecto"
    },
    {
      icon: "bi bi-award",
      title: "Excelencia",
      description: "Calidad y perfección en cada etapa del proceso"
    }
  ];

  teamMembers: TeamMember[] = [];

  stats = [
    { value: 6, label: 'Años de Experiencia' },
    { value: 50, label: 'Proyectos Completados' },
    { value: 7, label: 'Arquitectos Especializados' },
    { value: 15, label: 'Premios Internacionales' }
  ];

  

  ngOnInit(): void {
    this.setupScrollListener();
    this.displayedProjects = this.listProy.slice(0, 3);
    this.filteredProjects = this.listProy;
    this.startHeroSlider();

    this.listArqFull();
    this.listProyFull();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  async listArqFull(){
    this.listArq = await ListArquitectos(1) as ListArquitecto[];
  }
  async listProyFull(){
    this.listProy = await ListProyectosView();
    this.tamProy = this.listProy.length;
  }


  // Listeners de eventos
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isHeaderScrolled = window.scrollY > 50;
    this.isBackToTopVisible = window.scrollY > 300;
  }


  // Métodos de navegación y UI
  toggleMobileMenu(): void {
    this.isMobileMenuActive = !this.isMobileMenuActive;
  }

  closeMobileMenu(): void {
    this.isMobileMenuActive = false;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changeHeroSlide(index: number): void {
    this.activeHeroSlide = index;
  }

  // Métodos para proyectos
  filterProjects(category: string): void {
    this.activeFilter = category;
    if (category === 'all') {
      this.filteredProjects = this.listProy;
    } else {
      this.filteredProjects = this.listProy.filter(project => (project as any).category === category);
    }
    this.displayedProjects = this.filteredProjects.slice(0, 3);
    this.activeProjectIndex = 0;
  }

  nextSlide(): void {
    if (this.activeProjectIndex < this.filteredProjects.length - 3) {
      this.activeProjectIndex++;
      this.updateDisplayedProjects();
    }
  }

  prevSlide(): void {
    if (this.activeProjectIndex > 0) {
      this.activeProjectIndex--;
      this.updateDisplayedProjects();
    }
  }

  private updateDisplayedProjects(): void {
    this.displayedProjects = this.filteredProjects.slice(
      this.activeProjectIndex, 
      this.activeProjectIndex + 3
    );
  }

  goToTeamSlide(slideIndex: number): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentTeamSlide = slideIndex;
    this.updateTeamSlide();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.TRANSITION_DURATION);
  }

  private updateTeamSlide(instant: boolean = false): void {
    const cardElement = document.querySelector('.team-card');
    const cardWidth = cardElement ? cardElement.clientWidth : 320;
    const gap = 32; // 2rem en pixels
    
    const track = document.querySelector('.team-track') as HTMLElement;
    if (track) {
      if (instant) {
        track.style.transition = 'none';
      } else {
        track.style.transition = `transform ${this.TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      }
    }
    
    this.teamSlideOffset = -this.currentTeamSlide * (cardWidth + gap) * this.cardsPerView;
  }





  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Pausar auto slide al interactuar
  pauseAutoSlide(): void {
    this.stopAutoSlide();
  }

  // Métodos auxiliares
  private setupScrollListener(): void {
    this.isHeaderScrolled = window.scrollY > 50;
  }

  private startHeroSlider(): void {
    setInterval(() => {
      this.activeHeroSlide = (this.activeHeroSlide + 1) % 3;
    }, 5000);
  }

  get currentSlideProjects(): ProyectoViewList[] {
    return this.listProy.slice(this.currentSlide, this.currentSlide + 3);
  }

}