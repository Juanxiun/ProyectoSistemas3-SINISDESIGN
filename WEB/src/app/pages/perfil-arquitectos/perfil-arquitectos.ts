// deno-lint-ignore-file no-sloppy-imports
import { Component, HostListener, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NavbarCli } from "../../components/navbar-cli/navbar-cli";
import { FooterCli } from "../../components/footer-cli/footer-cli";
import {
  ListArqFullData,
  ListArquitectos,
} from "../../api/arquitectos/listArq";

@Component({
  selector: "app-perfil-arquitectos",
  templateUrl: "./perfil-arquitectos.html",
  styleUrls: ["./perfil-arquitectos.css"],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarCli, FooterCli],
})
export class PerfilArquitectos implements OnInit {
  @Input() proy: string | null = null;
  countArq: number = 0;

  listArq: ListArqFullData[] = [];

  filteredArchitects: ListArqFullData[] = [];
  especialidad: string[] = [];
  activeFilter: string = "all";

  // Variables para el carrusel del hero
  currentTeamSlide: number = 0;
  teamSlides: any[] = [
    {
      background:
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    },
    {
      background:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    },
    {
      background:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  // Variables para el botón "Back to Top"
  isBackToTopVisible: boolean = false;

  stats = [{ value: "", label: "" }];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    
    this.proy = this.route.snapshot.paramMap.get('tamProy');
    this.listGetChage();
    this.filteredArchitects = this.listArq;

    this.startAutoSlide();
    this.setupScrollListener();
  }

  async listGetChage() {
    this.listArq = await ListArquitectos(0) as ListArqFullData[];
    this.especialidadChange();
    this.countArq = this.listArq.length;

    this.stats = [
      { value: "+" + (parseInt((this.proy ?? "0")) - 2), label: "Proyectos Completados" },
      { value: "+" + this.countArq.toString(), label: "Arquitectos Especializados" },
      { value: "+12", label: "Servicios ofrecidos" },
    ];
  }

  especialidadChange(): void {
    const allEspecializaciones = this.listArq.flatMap((arq) =>
      arq.especializacion || []
    );
    this.especialidad = [...new Set(allEspecializaciones)];
  }

  // Métodos para el carrusel del hero
  changeTeamSlide(slideIndex: number): void {
    this.currentTeamSlide = slideIndex;
  }

  startAutoSlide(): void {
    setInterval(() => {
      this.currentTeamSlide = (this.currentTeamSlide + 1) %
        this.teamSlides.length;
    }, 5000); // Cambia cada 5 segundos
  }

  // Métodos para el botón "Back to Top"
  setupScrollListener(): void {
    window.addEventListener("scroll", () => {
      this.isBackToTopVisible = window.scrollY > 300;
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  filterArchitects(category: string): void {
    this.activeFilter = category;

    if (category === "all") {
      this.filteredArchitects = this.listArq;
    } else {
      this.filteredArchitects = this.listArq.filter((architect) =>
        architect.especializacion?.some((e) => e.especialidad === category)
      );
    }
  }

  getArchitectCategories(): string[] {
    const allCategories = this.listArq.flatMap((architect) =>
      architect.especializacion
    );
    return [...new Set(allCategories)];
  }

  // Manejar el evento de teclado para accesibilidad
  @HostListener("window:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      this.currentTeamSlide =
        (this.currentTeamSlide - 1 + this.teamSlides.length) %
        this.teamSlides.length;
    } else if (event.key === "ArrowRight") {
      this.currentTeamSlide = (this.currentTeamSlide + 1) %
        this.teamSlides.length;
    }
  }
}
