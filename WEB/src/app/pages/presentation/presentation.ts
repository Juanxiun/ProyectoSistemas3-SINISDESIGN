import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarCli } from "../../components/navbar-cli/navbar-cli";
import { FooterCli } from "../../components/footer-cli/footer-cli";

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  location?: string;
}

interface Service {
  number: string;
  icon: string;
  title: string;
  items: string[];
}

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

  // Datos
  services: Service[] = [
    {
      number: "01",
      icon: "bi bi-house-door",
      title: "Diseño Arquitectónico",
      items: [
        "Planos de construcción y detalle",
        "Renderizado y control de calidad",
        "Planificación 3D y visualizaciones",
        "Asesoramiento en materiales y acabados"
      ]
    },
    {
      number: "02",
      icon: "bi bi-gear",
      title: "Gestión de Proyectos",
      items: [
        "Dirección y administración de obras",
        "Fiscalización y control de calidad",
        "Gestión de permisos y licencias",
        "Coordinación de equipos especializados"
      ]
    },
    {
      number: "03",
      icon: "bi bi-brush",
      title: "Consultoría Especializada",
      items: [
        "Certificación de terrenos y obras",
        "Evaluaciones técnicas y peritajes",
        "Planes de sostenibilidad",
        "Licencias de Ruta y actualización"
      ]
    }
  ];

  projects: Project[] = [
    {
      id: 1,
      title: "NOMBRE PROYECTO",
      description: "Diseño contemporáneo con integración de espacios interiores y exteriores para una experiencia única.",
      imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "residencial",
      location: "La paz, Bolivia"
    },
    {
      id: 2,
      title: "PROYECTO RESIDENCIAL",
      description: "Arquitectura moderna con énfasis en iluminación natural y espacios funcionales.",
      imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "residencial",
      location: "La Paz, Bolivia"
    },
    {
      id: 3,
      title: "EDIFICIO CORPORATIVO",
      description: "Diseño de vanguardia con tecnología sustentable y espacios colaborativos.",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "comercial",
      location: "Santa Cruz, Bolivia"
    },
    {
      id: 4,
      title: "CASA CONTEMPORÁNEA",
      description: "Integración perfecta entre arquitectura moderna y naturaleza.",
      imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "residencial",
      location: "Cochabamba, Bolivia"
    },
    {
      id: 5,
      title: "OFICINAS CORPORATIVAS",
      description: "Espacios de trabajo innovadores que fomentan la colaboración.",
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      category: "comercial",
      location: "La Paz, Bolivia"
    },
    {
      id: 6,
      title: "INTERIORISMO MODERNO",
      description: "Diseño de interiores que combina funcionalidad y estética.",
      imageUrl: "https://i.pinimg.com/originals/a8/4d/4e/a84d4ec7f54efb81c43978ca2a54fe8c.jpg",
      category: "interiorismo",
      location: "Madrid, Bolivia"
    }
  ];

  displayedProjects: Project[] = [];
  filteredProjects: Project[] = [];

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

  private baseTeamMembers: TeamMember[] = [
    {
      name: "Arq. Elena Martínez",
      role: "Directora General",
      specialty: "Arquitectura Sustentable & Diseño Bioclimático",
      image: "https://media.istockphoto.com/id/1427466087/es/foto/belleza-de-mujer-con-maquillaje-de-piel-suave-y-joyas-de-oro-hermosa-chica-con-labios.jpg?s=612x612&w=0&k=20&c=F7ZSBjpRtK-6rbk-rM4Mcj3qstTUMWC7WnifjHMG200=",
      skills: ["Sustentabilidad", "Diseño Bioclimático", "Planificación Urbana"],
      linkedin: "#",
      email: "elena@sinisdesign.com",
      whatsapp: "#"
    },
    {
      name: "Arq. Diego Silva",
      role: "Director de Proyectos",
      specialty: "Arquitectura Residencial & Interiorismo",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      skills: ["Diseño Residencial", "Interiorismo", "Render 3D"],
      linkedin: "#",
      email: "diego@sinisdesign.com",
      whatsapp: "#"
    },
    {
      name: "Arq. Sofia Chen",
      role: "Especialista en Comercial",
      specialty: "Arquitectura Comercial & Retail Design",
      image: "https://content.elmueble.com/medio/2024/07/25/carmen-lomana_813500f2_240725192807_900x900.jpg",
      skills: ["Espacios Comerciales", "Retail Design", "Branding Arquitectónico"],
      linkedin: "#",
      email: "sofia@sinisdesign.com",
      whatsapp: "#"
    },
    {
      name: "Arq. Alejandro Rojas",
      role: "Especialista Técnico",
      specialty: "Estructuras & Gestión de Construcción",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      skills: ["Estructuras", "Gestión de Obra", "Normativas"],
      linkedin: "#",
      email: "alejandro@sinisdesign.com",
      whatsapp: "#"
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
    this.displayedProjects = this.projects.slice(0, 3);
    this.filteredProjects = this.projects;
    this.startHeroSlider();
    
    // Inicializar carrusel infinito de equipo
    this.initializeInfiniteCarousel();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Listeners de eventos
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isHeaderScrolled = window.scrollY > 50;
    this.isBackToTopVisible = window.scrollY > 300;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCardsPerView();
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
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter(project => project.category === category);
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

  // Métodos para el carrusel infinito de equipo
  private initializeInfiniteCarousel(): void {
    // Duplicar los miembros para efecto infinito
    this.teamMembers = [...this.baseTeamMembers, ...this.baseTeamMembers, ...this.baseTeamMembers];
    this.updateCardsPerView();
  }

  nextTeamSlide(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentTeamSlide++;
    
    this.updateTeamSlide();
    
    // Resetear a la posición inicial cuando llegue al final (efecto infinito)
    setTimeout(() => {
      if (this.currentTeamSlide >= this.baseTeamMembers.length) {
        this.currentTeamSlide = 0;
        this.updateTeamSlide(true); // Sin transición
      }
      this.isTransitioning = false;
    }, this.TRANSITION_DURATION);
  }

  prevTeamSlide(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentTeamSlide--;
    
    if (this.currentTeamSlide < 0) {
      this.currentTeamSlide = this.baseTeamMembers.length - 1;
      this.updateTeamSlide(true); // Sin transición para el reset
    } else {
      this.updateTeamSlide();
    }
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.TRANSITION_DURATION);
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

  private updateCardsPerView(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.cardsPerView = 1;
    } else if (width < 1024) {
      this.cardsPerView = 2;
    } else {
      this.cardsPerView = 3;
    }
    
    // Recalcular indicadores basados en los miembros originales
    this.teamIndicators = Array(this.baseTeamMembers.length).fill(0).map((x, i) => i);
    this.updateTeamSlide(true);
  }

  // Auto slide automático
  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextTeamSlide();
    }, 4000); // Cambia cada 4 segundos
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

  resumeAutoSlide(): void {
    this.startAutoSlide();
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

  get currentSlideProjects(): Project[] {
    return this.projects.slice(this.currentSlide, this.currentSlide + 3);
  }

  // Método para obtener el índice real (para los indicadores)
  get realTeamSlideIndex(): number {
    return this.currentTeamSlide % this.baseTeamMembers.length;
  }
}