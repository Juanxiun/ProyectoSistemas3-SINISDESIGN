import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar'; // ✅ Ruta corregida

@Component({
  selector: 'app-nueva-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reunion.html',
  styleUrls: ['./nueva-reunion.css']
})
export class NuevaReunionComponent {
  titulo: string = '';
  fecha: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  participantes: string = '';
  descripcion: string = '';

  constructor(private router: Router) {}

  crearReunion() {
    console.log('Nueva reunión creada:', {
      titulo: this.titulo,
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      participantes: this.participantes,
      descripcion: this.descripcion
    });

    alert('✅ Reunión creada correctamente (modo demostración).');
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.titulo = '';
    this.fecha = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.participantes = '';
    this.descripcion = '';
  }

  volverAProyectos() {
    // Vuelve a la vista de reuniones dentro de proyectos
    this.router.navigate(['/proyectos']);
  }
}
