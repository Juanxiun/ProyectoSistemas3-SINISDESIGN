import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarCli } from "../../components/navbar-cli/navbar-cli";
import { FooterCli } from "../../components/footer-cli/footer-cli";
import { ListArquitecto, ListArquitectos } from '../../api/arquitectos/listArq';
import { servicesData, ServiciosOfrecidos } from './info.data';
import { ListProyectosView, ProyectoViewList } from '../../api/proyectos/list';

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
  isHeaderScrolled = false;
  isMobileMenuActive = false;
  isBackToTopVisible = false;
  activeHeroSlide = 0;

  loadingProjects = true; // loader de proyectos

  listProy: ProyectoViewList[] = [];
  filteredProjects: ProyectoViewList[] = [];
  displayedProjects: ProyectoViewList[] = [];
  activeProjectIndex = 0;
  activeFilter = 'all';
  projectsPerPage = 6;

  listArq: ListArquitecto[] = [];
  teamMembers: TeamMember[] = [];
  currentTeamSlide = 0;
  teamSlideOffset = 0;
  cardsPerView = 3;
  private autoSlideInterval: any;
  private isTransitioning = false;
  private readonly TRANSITION_DURATION = 500;

  services: ServiciosOfrecidos[] = servicesData;
  values: Value[] = [
    { icon: "bi bi-flower1", title: "Sostenibilidad", description: "Comprometidos con el medio ambiente y construcciones ecológicas" },
    { icon: "bi bi-lightbulb", title: "Innovación", description: "Soluciones creativas y tecnologías de vanguardia" },
    { icon: "bi bi-heart", title: "Pasión", description: "Amor por el diseño en cada detalle y proyecto" },
    { icon: "bi bi-award", title: "Excelencia", description: "Calidad y perfección en cada etapa del proceso" }
  ];
  ngOnInit(): void {
    this.setupScrollListener();
    this.startHeroSlider();
    this.loadArquitectos();
    this.loadProyectos();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  async loadArquitectos() {
    this.listArq = await ListArquitectos(1) as ListArquitecto[];
  }

  async loadProyectos() {
    try {
      const allProjects = await ListProyectosView();
      // Solo proyectos con est === 1
      this.listProy = allProjects.filter(p => p.est === 1);
      this.filteredProjects = [...this.listProy];
      this.updateDisplayedProjects();
    } catch (err) {
      console.error("Error cargando proyectos:", err);
    } finally {
      this.loadingProjects = false; 
    }
  }
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isHeaderScrolled = window.scrollY > 50;
    this.isBackToTopVisible = window.scrollY > 300;
  }

  toggleMobileMenu(): void { this.isMobileMenuActive = !this.isMobileMenuActive; }
  closeMobileMenu(): void { this.isMobileMenuActive = false; }
  scrollToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  changeHeroSlide(index: number): void { this.activeHeroSlide = index; }

  get projectTypes(): string[] {
    const types = this.listProy.map(p => p.tipo);
    return Array.from(new Set(types));
  }

  filterProjects(category: string): void {
    this.activeFilter = category;
    this.activeProjectIndex = 0;

    let filtered = this.listProy.filter(p => p.est === 1);
    if (category !== 'all') {
      filtered = filtered.filter(p => p.tipo?.toLowerCase() === category.toLowerCase());
    }

    this.filteredProjects = filtered;
    this.updateDisplayedProjects();
  }
  nextSlide(): void {
    if (this.hasNextProjects) {
      this.activeProjectIndex++;
      this.updateDisplayedProjects();
    }
  }

  prevSlide(): void {
    if (this.hasPrevProjects) {
      this.activeProjectIndex--;
      this.updateDisplayedProjects();
    }
  }

  private updateDisplayedProjects(): void {
    const start = this.activeProjectIndex * this.projectsPerPage;
    const end = start + this.projectsPerPage;
    this.displayedProjects = this.filteredProjects.slice(start, end);
  }

  get hasNextProjects(): boolean {
    return (this.activeProjectIndex + 1) * this.projectsPerPage < this.filteredProjects.length;
  }

  get hasPrevProjects(): boolean {
    return this.activeProjectIndex > 0;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.projectsPerPage);
  }

  get currentPage(): number {
    return this.activeProjectIndex + 1;
  }

  goToTeamSlide(slideIndex: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentTeamSlide = slideIndex;
    this.updateTeamSlide();
    setTimeout(() => this.isTransitioning = false, this.TRANSITION_DURATION);
  }

  private updateTeamSlide(instant: boolean = false): void {
    const card = document.querySelector('.team-card');
    const cardWidth = card ? card.clientWidth : 320;
    const gap = 32;
    const track = document.querySelector('.team-track') as HTMLElement;
    if (track) {
      track.style.transition = instant ? 'none' : `transform ${this.TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      this.teamSlideOffset = -this.currentTeamSlide * (cardWidth + gap) * this.cardsPerView;
    }
  }

  pauseAutoSlide(): void { this.stopAutoSlide(); }
  private stopAutoSlide(): void { if (this.autoSlideInterval) clearInterval(this.autoSlideInterval); }
  private setupScrollListener(): void { this.isHeaderScrolled = window.scrollY > 50; }
  private startHeroSlider(): void {
    setInterval(() => { this.activeHeroSlide = (this.activeHeroSlide + 1) % 3; }, 5000);
  }

  currentSlideProy = 0;
  get currentSlideProjects(): ProyectoViewList[] {
    return this.listProy.slice(this.currentSlideProy, this.currentSlideProy + 3);
  }

  nextHeroSlide(): void {
    this.currentSlideProy = (this.currentSlideProy + 1) % this.listProy.length;
  }
}
