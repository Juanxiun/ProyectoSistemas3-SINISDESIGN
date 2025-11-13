import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProyData, ProyProps } from "../../../api/proyectos/poryData";
import { ProyFase, FaseProps } from "../../../api/proyectos/proyFase";
import { ProyTipo, TipoProps } from "../../../api/proyectos/proyTipo";
import { Router } from "@angular/router";

@Component({
  selector: "app-proy-info",
  imports: [CommonModule],
  templateUrl: "./proy-info.html",
  standalone: true
})
export class ProyInfo implements OnInit {
  @Input() idproy: number = 0;
  @Input() usr: string = "";

  tipo: TipoProps | null = null;
  fases: FaseProps[] = [];
  faseActual: FaseProps | null = null;
  proyectoData: ProyProps | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      await this.loadProjectData();
      await this.loadTipoData();
      await this.loadFasesData();
    } catch (error) {
      this.error = 'Error al cargar los datos del proyecto';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async loadProjectData() {
    try {
      const data = await ProyData(this.usr, this.idproy.toString());

      if (data && data.length > 0) {
        this.proyectoData = data[0];
        this.cdr.detectChanges();
      } else {
        this.error = 'No se encontró información del proyecto';
      }
    } catch (error) {
      this.error = 'Error al cargar el proyecto';
    }
  }

  private async loadTipoData() {
    try {
      const tipoData = await ProyTipo(this.idproy.toString());

      if (tipoData && tipoData.length > 0) {
        this.tipo = tipoData[0];
      } else {
        this.tipo = null;
      }
    } catch (error) {
      this.tipo = null;
    }
  }

  private async loadFasesData() {
    try {
      const fasesData = await ProyFase(this.idproy.toString());

      this.fases = fasesData || [];

      this.fases.sort((a, b) => {
        const fechaA = this.parseDate(a.inicio);
        const fechaB = this.parseDate(b.inicio);
        if (!fechaA || !fechaB) return 0;
        return fechaA.getTime() - fechaB.getTime();
      });

      this.faseActual = this.getFaseActual();

      if (this.fases.length === 0) {
      }
    } catch (error) {
      this.fases = [];
      this.faseActual = null;
    }
  }

  getFaseActual(): FaseProps | null {
    if (!this.fases || this.fases.length === 0) {
      return null;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicioProyecto = this.proyectoData?.inicio ? this.parseDate(this.proyectoData.inicio) : hoy;

    const fasesEnProgreso = this.fases.filter(f => f.estado === 2);
    if (fasesEnProgreso.length > 0) {
      const faseEnProgreso = fasesEnProgreso.sort((a, b) => {
        const fechaA = this.parseDate(a.inicio);
        const fechaB = this.parseDate(b.inicio);
        if (!fechaA || !fechaB) return 0;
        return fechaA.getTime() - fechaB.getTime();
      })[0];

      return faseEnProgreso;
    }

    if (fechaInicioProyecto && this.esMismaFecha(fechaInicioProyecto, hoy)) {
      return this.fases[0];
    }

    // Buscar fases que ya deberían haber comenzado
    const fasesQueDebenEstarActivas = this.fases.filter(fase => {
      const inicioFase = this.parseDate(fase.inicio);
      if (!inicioFase) return false;
      inicioFase.setHours(0, 0, 0, 0);
      return inicioFase <= hoy;
    });

    if (fasesQueDebenEstarActivas.length > 0) {
      const faseActual = fasesQueDebenEstarActivas[fasesQueDebenEstarActivas.length - 1];
      return faseActual;
    }
    return this.fases[0];
  }

  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate();
  }

  parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      const cleanDateString = dateString.toString().trim();

      let date = new Date(cleanDateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      const mysqlFormat = cleanDateString.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (mysqlFormat) {
        const [, year, month, day, hour, minute, second] = mysqlFormat;
        date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // Intentar formato español
      const spanishFormat = cleanDateString.match(/(\d{1,2}) de (\w+) de (\d{4})/i);
      if (spanishFormat) {
        const [, day, month, year] = spanishFormat;

        const months: { [key: string]: string } = {
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
          'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
          'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };

        const monthNumber = months[month.toLowerCase()];
        if (monthNumber) {
          const isoString = `${year}-${monthNumber}-${day.padStart(2, '0')}T00:00:00`;
          date = new Date(isoString);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }

      // Intentar formato dd/mm/yyyy
      const parts = cleanDateString.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (parts) {
        date = new Date(`${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No definida';

    const date = this.parseDate(dateString);
    if (!date) {
      return 'Fecha inválida';
    }

    try {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  getEstadoClass(estado: number): string {
    const base = "px-3 py-1 rounded-full text-sm font-semibold";
    switch (estado) {
      case 1: return `${base} bg-green-100 text-green-800`;
      case 2: return `${base} bg-yellow-100 text-yellow-800`;
      case 3: return `${base} bg-blue-100 text-blue-800`;
      case 0: return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }

  getEstadoText(estado: number): string {
    switch (estado) {
      case 1: return "Activo";
      case 2: return "En Progreso";
      case 3: return "Completado";
      case 0: return "Cancelado";
      default: return "Desconocido";
    }
  }

  editarProyecto(): void {
    if (this.proyectoData?.id) {
      this.router.navigate(['/editar-proyecto', this.proyectoData.id], {
        queryParams: { arq: this.usr }
      });
    } else if (this.idproy) {
      this.router.navigate(['/editar-proyecto', this.idproy], {
        queryParams: { arq: this.usr }
      });
    }
  }

  goDocumentos(faseId: number | undefined): void {
    if (!faseId) {
      console.error('faseId no definido');
      return;
    }
    this.router.navigate([`/fases/${faseId}/documentos`]);
  }
}