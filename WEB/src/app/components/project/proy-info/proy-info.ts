// deno-lint-ignore-file no-sloppy-imports
import { Component, Input } from "@angular/core";
import { ProyData, ProyProps } from "../../../api/proyectos/poryData";
import { Title } from "@angular/platform-browser";
import { from, Observable } from "rxjs";
import { NgForOf, AsyncPipe, DatePipe } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-proy-info",
  imports: [NgForOf, AsyncPipe, DatePipe],
  templateUrl: "./proy-info.html",
  styleUrl: "./proy-info.css",
})
export class ProyInfo {
  @Input()
  idproy: number = 0;
  @Input()
  usr: string = "";

  proyecto$!: Observable<ProyProps[]>;

  constructor(
    private titleService: Title,
    private router: Router
  ) {}

  ngOnInit() {
    this.proyecto$ = from(ProyData(this.usr, this.idproy.toString()));
    this.proyecto$.subscribe((proyectos) => {
      if (proyectos && proyectos.length > 0) {
        this.titleService.setTitle("Proyecto: " + proyectos[0].nombre);
      }
    });
  }

  editarProyecto(proyectoId: number | undefined): void {
    if (proyectoId) {
      // Navegar al componente de edición que ya tienes (crear-proyectos adaptado)
      this.router.navigate(['/editar-proyecto', proyectoId], {
        queryParams: { arq: this.usr }
      });
    }
  }

  getImagenUrl(imagen: string | File): string {
    if (typeof imagen === 'string') {
      return imagen;
    }
    // Si es un File object, crear URL temporal
    return imagen ? URL.createObjectURL(imagen) : '';
  }

  formatFecha(fechaString: string): string {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return fechaString;
    }
  }

  getEstadoClass(estado: number): string {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold";
    switch(estado) {
      case 1: // Activo
        return `${baseClasses} bg-green-100 text-green-800`;
      case 2: // En pausa
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 3: // Completado
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 0: // Cancelado
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getEstadoText(estado: number): string {
    switch(estado) {
      case 1: return "Activo";
      case 2: return "En Pausa";
      case 3: return "Completado";
      case 0: return "Cancelado";
      default: return "Desconocido";
    }
  }
}