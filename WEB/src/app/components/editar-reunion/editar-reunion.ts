import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  actualizarReunion,
  eliminarReunion,
  Reunion,
} from "../../api/reuniones/reunionCrud";

@Component({
  selector: "app-editar-reunion",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./editar-reunion.html",
  styleUrls: ["./editar-reunion.css"],
})
export class EditarReunion implements OnChanges {
  @Input() reunion!: Reunion;
  @Output() cerrar = new EventEmitter<boolean>();

  guardando: boolean = false;

  // Campos editables
  fecha: string = "";
  horaInicio: string = "";
  horaFin: string = "";

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["reunion"] && this.reunion) {
      // Convertir fecha original a partes separadas
      const fechaInicioStr = this.reunion.fecha;

      if (fechaInicioStr) {
        const fechaInicio = new Date(fechaInicioStr);

        // yyyy-mm-dd
        this.fecha = fechaInicio.toISOString().split("T")[0];

        // HH:mm
        this.horaInicio = fechaInicio.toISOString().substring(11, 16);
      }

      // fecha_final (puede venir vacío)
      const fechaFinStr = (this.reunion as any).fecha_final;

      if (fechaFinStr) {
        const fechaFin = new Date(fechaFinStr);
        this.horaFin = fechaFin.toISOString().substring(11, 16);
      } else {
        this.horaFin = this.horaInicio; // si no hay fin, igual a inicio
      }
    }
  }

  // Convierte Fecha + Hora => formato MySQL correcto
  private toMySQLDate(date: string, hour: string): string {
    return `${date} ${hour}:00`;
  }

  // Guardar cambios
  async guardarCambios() {
    if (!this.fecha || !this.horaInicio) {
      alert("Por favor ingresa una fecha y hora de inicio.");
      return;
    }

    const fechaInicioMySQL = this.toMySQLDate(this.fecha, this.horaInicio);
    const fechaFinMySQL = this.toMySQLDate(this.fecha, this.horaFin);

    const actualizada: Reunion = {
      ...this.reunion,
      fecha: fechaInicioMySQL,
      fecha_final: fechaFinMySQL,
    };

    this.guardando = true;

    try {
      const ok = await actualizarReunion(this.reunion.id!, actualizada);

      if (ok) {
        alert("✅ Reunión actualizada correctamente.");
        this.cerrar.emit(true);
      } else {
        alert("❌ Ocurrió un error al actualizar.");
      }
    } catch (error) {
      console.error("❌ Error en guardarCambios:", error);
      alert("Error interno.");
    } finally {
      this.guardando = false;
    }
  }

  async eliminar() {
    if (!this.reunion?.id) return;

    if (!confirm("¿Deseas eliminar esta reunión?")) return;

    try {
      const ok = await eliminarReunion(this.reunion.id);

      if (ok) {
        alert("🗑️ Reunión eliminada correctamente.");
        this.cerrar.emit(true);
      } else {
        alert("❌ Error al eliminar la reunión.");
      }
    } catch (err) {
      console.error("Error al eliminar reunión:", err);
      alert("Error interno.");
    }
  }

  cancelar() {
    this.cerrar.emit(false);
  }
}
