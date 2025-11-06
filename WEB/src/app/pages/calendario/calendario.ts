import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { NuevaReunionComponent } from "../../components/nueva-reunion/nueva-reunion";
import { getReuniones } from "../../api/reuniones/reunionCrud";

@Component({
  selector: "app-calendario",
  standalone: true,
  imports: [CommonModule, Navbar, Siderbar, NuevaReunionComponent],
  templateUrl: "./calendario.html",
  styleUrls: ["./calendario.css"],
})
export class Calendario implements OnInit {
  fechaActual: Date = new Date();
  semanas: Date[][] = [];
  mesActual: string = "";
  anioActual: number = 0;
  hoy: Date = new Date();
  userData: any = null;
  reuniones: any[] = [];
  proyectoId: number = 1;
  mostrarFormulario: boolean = false;

  constructor(
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.actualizarCalendario();

    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
    } else {
      this.router.navigate(["/"]);
    }

    this.cargarReuniones();
  }

  convertirFecha(fecha: string | Date): Date {
    return new Date(fecha);
  }

  async cargarReuniones() {
    try {
      const data = await getReuniones(this.proyectoId);
      console.log("📡 Respuesta cruda del backend (normalizada):", data);

      this.reuniones = data.map((r: any) => ({
        id: r.id,
        title: r.titulo,
        start: r.fecha,
        description: r.descripcion,
        estado: r.estado,
        proy: r.proy
      }));

      console.log("📅 Reuniones cargadas:", this.reuniones);
    } catch (error) {
      console.error("❌ Error al cargar reuniones:", error);
      this.reuniones = [];
    }
  }

  actualizarCalendario(): void {
    const year = this.fechaActual.getFullYear();
    const month = this.fechaActual.getMonth();

    this.mesActual = this.fechaActual.toLocaleDateString("es-ES", { month: "long" });
    this.anioActual = year;

    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    this.semanas = [];
    let semana: Date[] = [];

    for (let i = primerDia.getDay(); i > 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i);
      semana.push(new Date(fecha));
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(year, month, dia);
      semana.push(fecha);

      if (semana.length === 7) {
        this.semanas.push([...semana]);
        semana = [];
      }
    }

    if (semana.length > 0) {
      while (semana.length < 7) {
        const ultimaFecha = semana[semana.length - 1];
        const siguienteDia = new Date(ultimaFecha);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        semana.push(siguienteDia);
      }
      this.semanas.push(semana);
    }
  }

  esMismoDia(fecha1: Date, fecha2: Date): boolean {
    return (
      fecha1.getDate() === fecha2.getDate() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getFullYear() === fecha2.getFullYear()
    );
  }

  esMesActual(fecha: Date): boolean {
    return fecha.getMonth() === this.fechaActual.getMonth();
  }

  mesAnterior(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() - 1);
    this.actualizarCalendario();
  }

  mesSiguiente(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + 1);
    this.actualizarCalendario();
  }

  irHoy(): void {
    this.fechaActual = new Date();
    this.actualizarCalendario();
  }

  obtenerReunionesDelDia(fecha: Date) {
    return this.reuniones.filter(r => this.esMismoDia(this.convertirFecha(r.start), fecha));
  }

  // 🟢 Agregar estos dos métodos:
  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.cargarReuniones(); // 🔄 Refresca al cerrar el formulario
  }
}
