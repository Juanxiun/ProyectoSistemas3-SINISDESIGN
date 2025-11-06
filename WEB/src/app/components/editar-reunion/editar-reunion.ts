import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { actualizarReunion, eliminarReunion, Reunion } from "../../api/reuniones/reunionCrud";

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

  // Variables locales para manejar la fecha y hora separadas
  fecha: string = "";
  horaInicio: string = "";
  horaFin: string = "";

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["reunion"] && this.reunion) {
      // Asegurarnos de que usamos el campo real 'fecha' que trae la API
      const fechaStr = (this.reunion as any).fecha ?? "";
      if (fechaStr) {
        // Normalizar posibles formatos (ISO con zona o sin)
        const fechaCompleta = new Date(fechaStr);
        // yyyy-mm-dd
        this.fecha = fechaCompleta.toISOString().split("T")[0];
        // HH:MM
        this.horaInicio = fechaCompleta.toTimeString().slice(0, 5);
        // Si no manejas hora de fin, igualamos a inicio (puedes ajustarlo)
        this.horaFin = this.horaInicio;
      } else {
        // Si no hay fecha, limpiar valores
        this.fecha = "";
        this.horaInicio = "";
        this.horaFin = "";
      }
    }
  }

  async guardarCambios() {
    if (!this.reunion || !this.reunion.id) {
      alert("Reunión inválida.");
      return;
    }

    // Validación básica
    if (!this.fecha || !this.horaInicio) {
      alert("Por favor ingresa fecha y hora de inicio.");
      return;
    }

    this.guardando = true;
    try {
      // Construir fecha en formato que acepta tu API (ISO local -> tu CRUD lo convierte a MySQL)
      const fechaHora = `${this.fecha}T${this.horaInicio}`;

      const actualizada: Reunion = {
        ...this.reunion,
        fecha: fechaHora,
      };

      const ok = await actualizarReunion(this.reunion.id!, actualizada);
      if (ok) {
        alert("✅ Reunión actualizada correctamente.");
        this.cerrar.emit(true);
      } else {
        alert("❌ Error al actualizar la reunión.");
      }
    } catch (err) {
      console.error("❌ Error en guardarCambios:", err);
      alert("Error interno al guardar los cambios.");
    } finally {
      this.guardando = false;
    }
  }

  async eliminar() {
    if (!this.reunion || !this.reunion.id) return;

    if (!confirm("¿Seguro que deseas eliminar esta reunión?")) return;
    try {
      const ok = await eliminarReunion(this.reunion.id!);
      if (ok) {
        alert("🗑️ Reunión eliminada correctamente.");
        this.cerrar.emit(true);
      } else {
        alert("❌ Error al eliminar la reunión.");
      }
    } catch (error) {
      console.error("Error al eliminar reunión:", error);
      alert("Error interno al eliminar la reunión.");
    }
  }

  cancelar() {
    this.cerrar.emit(false);
  }
}
