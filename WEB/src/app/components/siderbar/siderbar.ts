import { Component , Output, EventEmitter } from '@angular/core';
import { Options } from "../../elements/options/options";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-siderbar',
  standalone: true,
  imports: [Options, CommonModule],
  /* Añadido del import a CommonModule, y el StandAlone para la llamada a mi componente calendario */
  templateUrl: './siderbar.html',
  styles: ``
})
export class Siderbar {
  proy = false;
  rep = false;
  reu = false;
  logout = false;

  @Output() cambiarVista = new EventEmitter<'proyectos' | 'reuniones'>();

  onCambiarVista(vista: 'proyectos' | 'reuniones'): void {
    this.cambiarVista.emit(vista);
  }
}
