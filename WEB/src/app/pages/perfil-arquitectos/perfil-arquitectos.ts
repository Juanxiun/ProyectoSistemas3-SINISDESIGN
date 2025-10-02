import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarCli } from "../../components/navbar-cli/navbar-cli";
import { FooterCli } from "../../components/footer-cli/footer-cli";

interface Architect {
  id: number;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  categories: string[];
  skills: string[];
  linkedin: string;
  email: string;
  whatsapp: string;
}

@Component({
  selector: 'app-perfil-arquitectos',
  templateUrl: './perfil-arquitectos.html',
  styleUrls: ['./perfil-arquitectos.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarCli, FooterCli]
})
export class PerfilArquitectos implements OnInit {
  architects: Architect[] = [
    {
      id: 1,
      name: "Arq. Elena Martínez",
      role: "Directora General & Fundadora",
      specialty: "Arquitectura Sustentable & Diseño Bioclimático",
      bio: "Especializada en diseño sostenible y arquitectura bioclimática. Elena combina innovación tecnológica con principios ecológicos para crear espacios que respetan el medio ambiente.",
      image: "https://media.istockphoto.com/id/1427466087/es/foto/belleza-de-mujer-con-maquillaje-de-piel-suave-y-joyas-de-oro-hermosa-chica-con-labios.jpg?s=612x612&w=0&k=20&c=F7ZSBjpRtK-6rbk-rM4Mcj3qstTUMWC7WnifjHMG200=",
      experience: "15+ Años",
      categories: ["directivos"],
      skills: ["Sustentabilidad", "Diseño Bioclimático", "Planificación Urbana", "Certificación LEED"],
      linkedin: "#",
      email: "elena@sinisdesign.com",
      whatsapp: "#"
    },
    {
      id: 2,
      name: "Arq. Diego Silva",
      role: "Director de Proyectos",
      specialty: "Arquitectura Residencial & Interiorismo",
      bio: "Apasionado por crear espacios residenciales que combinan funcionalidad y belleza. Diego se especializa en transformar visiones en hogares extraordinarios.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      experience: "12+ Años",
      categories: ["directivos", "residencial"],
      skills: ["Diseño Residencial", "Interiorismo", "Render 3D", "Remodelación"],
      linkedin: "#",
      email: "diego@sinisdesign.com",
      whatsapp: "#"
    },
    {
      id: 3,
      name: "Arq. Sofia Chen",
      role: "Especialista en Comercial",
      specialty: "Arquitectura Comercial & Retail Design",
      bio: "Experta en crear espacios comerciales que optimizan la experiencia del cliente y maximizan el retorno de inversión. Sofia domina el diseño de retail y oficinas corporativas.",
      image: "https://content.elmueble.com/medio/2024/07/25/carmen-lomana_813500f2_240725192807_900x900.jpg",
      experience: "10+ Años",
      categories: ["comercial"],
      skills: ["Espacios Comerciales", "Retail Design", "Branding Arquitectónico", "Diseño Corporativo"],
      linkedin: "#",
      email: "sofia@sinisdesign.com",
      whatsapp: "#"
    },
    {
      id: 4,
      name: "Arq. Alejandro Rojas",
      role: "Especialista Técnico",
      specialty: "Estructuras & Gestión de Construcción",
      bio: "Especialista en ingeniería estructural y gestión de proyectos. Alejandro asegura que cada diseño sea técnicamente viable y se construya con los más altos estándares de calidad.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      experience: "14+ Años",
      categories: ["tecnico"],
      skills: ["Estructuras", "Gestión de Obra", "Normativas", "Presupuestos"],
      linkedin: "#",
      email: "alejandro@sinisdesign.com",
      whatsapp: "#"
    },
    {
      id: 5,
      name: "Arq. Valeria Ríos",
      role: "Diseñadora Senior",
      specialty: "Arquitectura de Interiores & Espacios Habitables",
      bio: "Especializada en crear interiores que cuentan historias. Valeria transforma espacios ordinarios en ambientes extraordinarios que reflejan la personalidad de sus habitantes.",
      image: "https://images.unsplash.com/photo-1604904612715-47bf9d9bc670?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVqZXJlcyUyMGRlJTIwdHJhamV8ZW58MHx8MHx8fDA%3D",
      experience: "8+ Años",
      categories: ["residencial"],
      skills: ["Interiorismo", "Diseño Habitacional", "Iluminación", "Mobiliario"],
      linkedin: "#",
      email: "valeria@sinisdesign.com",
      whatsapp: "#"
    },
    {
      id: 6,
      name: "Arq. Carlos Mendoza",
      role: "Especialista en Proyectos",
      specialty: "Arquitectura Institucional & Espacios Públicos",
      bio: "Con amplia experiencia en proyectos institucionales y espacios públicos. Carlos se especializa en crear edificaciones que sirven a la comunidad y promueven el bienestar social.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      experience: "11+ Años",
      categories: ["comercial", "tecnico"],
      skills: ["Institucional", "Espacios Públicos", "Accesibilidad", "Plan Maestro"],
      linkedin: "#",
      email: "carlos@sinisdesign.com",
      whatsapp: "#"
    }
  ];

  filteredArchitects: Architect[] = [];
  activeFilter: string = 'all';

  // Variables para el carrusel del hero
  currentTeamSlide: number = 0;
  teamSlides: any[] = [
    { background: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
    { background: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
    { background: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }
  ];

  // Variables para el botón "Back to Top"
  isBackToTopVisible: boolean = false;

  stats = [
    { value: '20+', label: 'Proyectos Completados' },
    { value: '7', label: 'Arquitectos Especializados' },
    { value: '+12', label: 'Servicios ofrecidos' }
  ];

  ngOnInit(): void {
    this.filteredArchitects = this.architects;
    
    // Iniciar el carrusel automático
    this.startAutoSlide();
    
    // Configurar el scroll listener para el botón "Back to Top"
    this.setupScrollListener();
  }

  // Métodos para el carrusel del hero
  changeTeamSlide(slideIndex: number): void {
    this.currentTeamSlide = slideIndex;
  }

  startAutoSlide(): void {
    setInterval(() => {
      this.currentTeamSlide = (this.currentTeamSlide + 1) % this.teamSlides.length;
    }, 5000); // Cambia cada 5 segundos
  }

  // Métodos para el botón "Back to Top"
  setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      this.isBackToTopVisible = window.scrollY > 300;
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  filterArchitects(category: string): void {
    this.activeFilter = category;
    
    if (category === 'all') {
      this.filteredArchitects = this.architects;
    } else {
      this.filteredArchitects = this.architects.filter(architect => 
        architect.categories.includes(category)
      );
    }
  }

  getArchitectCategories(): string[] {
    const allCategories = this.architects.flatMap(architect => architect.categories);
    return [...new Set(allCategories)];
  }

  // Manejar el evento de teclado para accesibilidad
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.currentTeamSlide = (this.currentTeamSlide - 1 + this.teamSlides.length) % this.teamSlides.length;
    } else if (event.key === 'ArrowRight') {
      this.currentTeamSlide = (this.currentTeamSlide + 1) % this.teamSlides.length;
    }
  }
}