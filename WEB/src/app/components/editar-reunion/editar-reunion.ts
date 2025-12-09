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
  @Input() reuniones: any[] = []; // ⭐ Todas las reuniones
  @Output() cerrar = new EventEmitter<boolean>();

  fecha: string = "";
  horaInicio: string = "";
  horaFin: string = "";

  guardando = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["reunion"] && this.reunion) {
      const inicio = new Date(this.reunion.fecha);

      const yyyy = inicio.getFullYear();
      const mm = String(inicio.getMonth() + 1).padStart(2, "0");
      const dd = String(inicio.getDate()).padStart(2, "0");

      this.fecha = `${yyyy}-${mm}-${dd}`;
      this.horaInicio = `${String(inicio.getHours()).padStart(2, "0")}:${String(
        inicio.getMinutes()
      ).padStart(2, "0")}`;

      if (this.reunion.fecha_final) {
        const fin = new Date(this.reunion.fecha_final);
        this.horaFin = `${String(fin.getHours()).padStart(
          2,
          "0"
        )}:${String(fin.getMinutes()).padStart(2, "0")}`;
      } else {
        this.horaFin = this.horaInicio;
      }
    }
  }

  // ⭐ Validación para evitar solapamientos
  private hayConflicto(inicio: Date, fin: Date): boolean {
    return this.reuniones.some(r => {
      if (r.id === this.reunion.id) return false; // ignorar la misma reunión

      const rInicio = new Date(r.fecha);
      const rFin = new Date(r.fecha_final || r.fecha);

      return (
        (inicio >= rInicio && inicio < rFin) ||
        (fin > rInicio && fin <= rFin) ||
        (inicio <= rInicio && fin >= rFin)
      );
    });
  }

  async guardarCambios() {
    if (!this.fecha || !this.horaInicio) {
      alert("Por favor ingresa una fecha y hora de inicio.");
      return;
    }

    const inicio = new Date(`${this.fecha} ${this.horaInicio}:00`);
    const fin = new Date(`${this.fecha} ${this.horaFin}:00`);

    // ⭐ Validación de conflicto
    if (this.hayConflicto(inicio, fin)) {
      alert("❌ Este horario ya está ocupado.");
      return;
    }

    const actualizada: Reunion = {
      ...this.reunion,
      fecha: `${this.fecha} ${this.horaInicio}:00`,
      fecha_final: `${this.fecha} ${this.horaFin}:00`,
    };

    this.guardando = true;

    const ok = await actualizarReunion(this.reunion.id!, actualizada);

    if (ok) {
      alert("✅ Reunión actualizada correctamente.");
      this.cerrar.emit(true);
    } else {
      alert("❌ Ocurrió un error al actualizar.");
    }

    this.guardando = false;
  }

  async eliminar() {
    if (!this.reunion?.id) return;

    if (!confirm("¿Deseas eliminar esta reunión?")) return;

    const ok = await eliminarReunion(this.reunion.id);

    if (ok) {
      alert("🗑️ Reunión eliminada correctamente.");
      this.cerrar.emit(true);
    } else {
      alert("❌ Error al eliminar.");
    }
  }

  cancelar() {
    this.cerrar.emit(false);
  }
}
