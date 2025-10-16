import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import FaseProps from '../../../api/proyectos/proyFase';

@Component({
  selector: 'app-fase-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./fase-card.html"
})
export class FaseCardComponent {
  @Input({ required: true }) fase!: FaseProps;

  getEstado(estado?: number): string {
    switch (estado) {
      case 1: return 'Completada';
      case 2: return 'En Progreso';
      case 3: return 'Cancelada';
      default: return 'Pendiente';
    }
  }
}