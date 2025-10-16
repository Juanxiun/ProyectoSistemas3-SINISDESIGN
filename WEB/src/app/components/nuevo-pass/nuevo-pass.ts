import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nuevo-pass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-pass.html',
  styleUrls: ['./nuevo-pass.css']
})
export class NuevoPass {
  @Output() navigate = new EventEmitter<'cli' | 'arq' | 'recuperar' | 'nuevo'>();

  codigoUsuario: string = '12345678';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  showPassword1: boolean = false;
  showPassword2: boolean = false;

  togglePassword1(): void {
    this.showPassword1 = !this.showPassword1;
  }

  togglePassword2(): void {
    this.showPassword2 = !this.showPassword2;
  }

  registrar(): void {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    console.log('Nuevo usuario creado con contraseña:', this.nuevaContrasena);
    alert('Usuario registrado correctamente.');
    this.navigate.emit('cli');
  }

  volverLogin(): void {
    this.navigate.emit('cli');
  }
}
