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
    const dia = this.fechaActual.getDay();
    const diff = this.fechaActual.getDate() - dia;
    this.inicioSemana = new Date(this.fechaActual.setDate(diff));
    this.finSemana = new Date(this.inicioSemana);
    this.finSemana.setDate(this.inicioSemana.getDate() + 6);

    this.diasSemana = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.inicioSemana);
      d.setDate(this.inicioSemana.getDate() + i);
      return d;
    });

    this.rangoSemana = `${this.inicioSemana.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })} - ${this.finSemana.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })}`;
  }

  semanaAnterior() {
    this.fechaActual.setDate(this.fechaActual.getDate() - 7);
    this.calcularSemanaActual();
  }

  semanaSiguiente() {
    this.fechaActual.setDate(this.fechaActual.getDate() + 7);
    this.calcularSemanaActual();
  }

  async cargarReuniones() {
    try {
      const data = await getReuniones(this.proyectoId);

      this.reuniones = data.map((r: any) => ({
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        fecha: new Date(r.fecha),
        horaInicio: r.hora_inicio || "09:00",
        horaFin: r.hora_fin || "10:00",
        estado: r.estado,
        proy: r.proy,
      }));

      console.log("✅ Reuniones cargadas:", this.reuniones);
    } catch (err) {
      console.error("❌ Error al cargar reuniones:", err);
      this.reuniones = [];
    }
  }

  obtenerReunionesDelDiaYHora(dia: Date, hora: number) {
    return this.reuniones.filter((r) => {
      const fecha = new Date(r.fecha);
      return (
        fecha.getDate() === dia.getDate() &&
        fecha.getMonth() === dia.getMonth() &&
        parseInt(r.horaInicio.split(":")[0]) === hora
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
}
