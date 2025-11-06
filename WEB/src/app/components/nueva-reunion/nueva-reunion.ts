import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { crearReunion } from '../../api/reuniones/reunionCrud'; // ✅ Importar API real

@Component({
  selector: 'app-nueva-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reunion.html',
  styleUrls: ['./nueva-reunion.css']
})
export class NuevaReunionComponent {
  @Output() reunionCreada = new EventEmitter<void>(); // ✅ Notifica al calendario

  titulo: string = '';
  fecha: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  participantes: string = '';
  descripcion: string = '';

  // Simularemos que siempre pertenece al proyecto 1 (ajusta con tu lógica real)
  proyectoId: number = 1;

  async crearReunion() {
    // 🧠 Validación básica
    if (!this.titulo || !this.fecha || !this.horaInicio) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // 🕒 Combinar fecha + hora inicio
    const fechaHora = `${this.fecha}T${this.horaInicio}`;

    // 🧾 Crear el objeto con formato correcto
    const nueva = {
      proy: this.proyectoId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fecha: fechaHora, // será convertido a formato MySQL en el CRUD
    };

    // 🚀 Llamar al endpoint
    const ok = await crearReunion(nueva);

    if (ok) {
      alert('✅ Reunión creada correctamente.');
      this.limpiarFormulario();
      this.reunionCreada.emit(); // notifica al calendario
    } else {
      alert('❌ Error al crear la reunión. Revisa la consola.');
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
}
