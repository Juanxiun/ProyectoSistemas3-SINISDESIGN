import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { crearReunion } from '../../api/reuniones/reunionCrud';

@Component({
  selector: 'app-nueva-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reunion.html',
  styleUrls: ['./nueva-reunion.css']
})
export class NuevaReunionComponent {

  @Input() reuniones: any[] = []; // ⭐ Se pasa desde el calendario
  @Output() reunionCreada = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  titulo: string = '';
  fecha: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  participantes: string = '';
  descripcion: string = '';

  proyectoId: number = 1;

  // ⭐ Función detectar conflictos
  private hayConflicto(inicio: Date, fin: Date): boolean {
    return this.reuniones.some(r => {
      const rInicio = new Date(r.fecha);
      const rFin = new Date(r.fecha_final || r.fecha);

      return (
        (inicio >= rInicio && inicio < rFin) ||
        (fin > rInicio && fin <= rFin) ||
        (inicio <= rInicio && fin >= rFin)
      );
    });
  }

  async crearReunion() {
    if (!this.titulo || !this.fecha || !this.horaInicio) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const fechaInicio = new Date(`${this.fecha} ${this.horaInicio}:00`);
    const fechaFin = new Date(`${this.fecha} ${this.horaFin}:00`);

    // ⭐ Validación de conflicto
    if (this.hayConflicto(fechaInicio, fechaFin)) {
      alert("❌ Ya existe una reunión en este horario.");
      return;
    }

    const nueva = {
      proy: this.proyectoId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fecha: `${this.fecha} ${this.horaInicio}:00`,
      fecha_final: `${this.fecha} ${this.horaFin}:00`,
    };

    const ok = await crearReunion(nueva);

    if (ok) {
      alert('✅ Reunión creada correctamente.');
      this.limpiarFormulario();
      this.reunionCreada.emit();
    } else {
      alert('❌ Error al crear la reunión.');
    }
  }

  limpiarFormulario() {
    this.titulo = '';
    this.fecha = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.participantes = '';
    this.descripcion = '';
  }

  cancelar() {
    this.cerrar.emit();
  }
}
