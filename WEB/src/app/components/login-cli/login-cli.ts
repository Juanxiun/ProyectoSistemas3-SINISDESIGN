import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-cli',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-cli.html',
  styleUrls: ['./login-cli.css']
})
export class LoginCli {
  @Output() navigate = new EventEmitter<'cli' | 'arq' | 'recuperar' | 'nuevo'>();

  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      codigoUsuario: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^[A-Za-z0-9]+$/) // solo letras y números
      ]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25)
      ]]
    });
  }

  // Getter de controles
  get f() {
    return this.loginForm.controls;
  }

  // Toggle de visibilidad de contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Envío del formulario
  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      console.warn('Formulario inválido');
      return;
    }

    console.log('Login cliente:', this.loginForm.value);
  }

  // Navegar a "Recuperar contraseña"
  goRecuperar(): void {
    this.navigate.emit('recuperar');
  }

  // Navegar a "Login Arquitecto"
  goArquitecto(): void {
    this.navigate.emit('arq');
  }
}
