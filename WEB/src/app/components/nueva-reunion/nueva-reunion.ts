import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from '../../components/calendario/calendario';

@Component({
  selector: 'app-nueva-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarioComponent],
  templateUrl: './nueva-reunion.html',
  styleUrls: ['./nueva-reunion.css']
})
export class NuevaReunionComponent {

  // Control de vistas (solo FrontEnd)
  currentView: 'reuniones' | 'nueva-reunion' = 'nueva-reunion';

  // Campos del formulario
  titulo = '';
  fecha = '';
  horaInicio = '';
  horaFin = '';
  participantes = '';
  descripcion = '';

  constructor() {}

  // Simulación de creación de reunión (solo front)
  crearReunion(): void {
    console.log('✅ Nueva reunión creada:', {
      titulo: this.titulo,
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      participantes: this.participantes,
      descripcion: this.descripcion
    });

    alert('✅ Reunión creada correctamente (modo demostración).');
    this.limpiarFormulario();
    this.cambiarVista('reuniones');
  }

  // Limpia el formulario
  limpiarFormulario(): void {
    this.titulo = '';
    this.fecha = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.participantes = '';
    this.descripcion = '';
  }

  // Cambia la vista visible sin destruir el componente
  cambiarVista(view: 'reuniones' | 'nueva-reunion'): void {
    this.currentView = view;
  }
}
