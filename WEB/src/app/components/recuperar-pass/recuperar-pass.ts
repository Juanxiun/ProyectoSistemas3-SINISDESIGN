import { Component, EventEmitter, Output  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperar-pass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-pass.html',
  styleUrl: './recuperar-pass.css'
})
export class RecuperarPass {
  @Output() navigate = new EventEmitter<'cli' | 'arq' | 'recuperar' | 'nuevo'>();
  correo: string = '';
  codigo: string = '';

  verificarCodigo(): void {
    if (!this.correo || !this.codigo) {
      alert('Por favor, completa ambos campos.');
      return;
    }
    alert(`Código ${this.codigo} verificado correctamente.`);
    this.navigate.emit('nuevo');
  }
}
