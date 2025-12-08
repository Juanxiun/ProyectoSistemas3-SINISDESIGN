import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { NuevaReunionComponent } from "../../components/nueva-reunion/nueva-reunion";
import { EditarReunion } from "../../components/editar-reunion/editar-reunion";
import { getReuniones } from "../../api/reuniones/reunionCrud";

@Component({
  selector: "app-calendario",
  standalone: true,
  imports: [CommonModule, Navbar, Siderbar, NuevaReunionComponent, EditarReunion],
  templateUrl: "./calendario.html",
  styleUrls: ["./calendario.css"],
})
export class Calendario implements OnInit {
  fechaActual = new Date();
  inicioSemana!: Date;
  finSemana!: Date;
  rangoSemana: string = "";

  diasSemana: Date[] = [];
  horas: number[] = Array.from({ length: 13 }, (_, i) => i + 6); // 06:00–18:00

  reuniones: any[] = [];
  userData: any = null;
  proyectoId = 1;

  mostrarFormulario = false;
  mostrarEditor = false;
  reunionSeleccionada: any = null;

  constructor(private router: Router, private cookieService: CookieService) {}

  ngOnInit(): void {
    if (this.cookieService.check("sesion")) {
      this.userData = JSON.parse(this.cookieService.get("sesion"));
    } else {
      this.router.navigate(["/"]);
    }

    this.calcularSemanaActual();
    this.cargarReuniones();
  }

  calcularSemanaActual() {
    const base = new Date(this.fechaActual); // COPIA para no dañar fechaActual
    const diaSemana = base.getDay(); 
    const inicio = new Date(base);
    inicio.setDate(base.getDate() - diaSemana);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    this.inicioSemana = inicio;
    this.finSemana = fin;

    this.diasSemana = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return d;
    });

    this.rangoSemana = `${inicio.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })} - ${fin.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })}`;
  }

  semanaAnterior() {
    this.fechaActual = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), this.fechaActual.getDate() - 7);
    this.calcularSemanaActual();
  }

  semanaSiguiente() {
    this.fechaActual = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), this.fechaActual.getDate() + 7);
    this.calcularSemanaActual();
  }


  async cargarReuniones() {
    try {
      const data = await getReuniones(this.proyectoId);

      this.reuniones = data.map((r: any) => {
      const fechaInicio = new Date(r.fecha);
      const fechaFin = r.fecha_final ? new Date(r.fecha_final) : null;

      return {
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        fecha: fechaInicio,
        fecha_final: fechaFin,
        horaInicio: fechaInicio.toTimeString().substring(0,5), // HH:mm
        horaFin: fechaFin ? fechaFin.toTimeString().substring(0,5) : null,
        estado: r.estado,
        proy: r.proy,
      };
    });

      console.log("✅ Reuniones cargadas:", this.reuniones);
    } catch (err) {
      console.error("❌ Error al cargar reuniones:", err);
      this.reuniones = [];
    }
  }

  obtenerReunionesDelDiaYHora(dia: Date, hora: number) {
    return this.reuniones.filter((r) => {
      return (
        r.fecha.getFullYear() === dia.getFullYear() &&
        r.fecha.getMonth() === dia.getMonth() &&
        r.fecha.getDate() === dia.getDate() &&
        r.fecha.getHours() === hora
      );
    });
  }

  // ➕ NUEVA reunión
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.mostrarEditor = false;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.cargarReuniones();
  }

  // ✏️ EDITAR reunión
  abrirEditor(reunion: any) {
    this.reunionSeleccionada = reunion;
    this.mostrarEditor = true;
    this.mostrarFormulario = false;
  }

  cerrarEditor(refrescar: boolean = false) {
    this.mostrarEditor = false;
    this.reunionSeleccionada = null;
    if (refrescar) this.cargarReuniones();
  }

  private extraerHora(fechaString: string): string {
    if (!fechaString) return "";
    return fechaString.substring(11, 16); // HH:mm
  }
}
