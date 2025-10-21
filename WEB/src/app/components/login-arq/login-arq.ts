import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-arq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-arq.html',
  styleUrls: ['./login-arq.css']
})
export class LoginArq implements OnInit {
  @Output() navigate = new EventEmitter<'cli' | 'arq' | 'recuperar' | 'nuevo'>();

  @Output() goRecuperar = new EventEmitter<void>(); // Para cambiar al formulario "recuperar"

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
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

  ngOnInit(): void {}

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    console.log('Login Arquitecto:', this.loginForm.value);
    // Aquí se podrá llamar al servicio de autenticación más adelante
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // 🔹 Llama al Page Login para cambiar de vista
  onRecuperarClick(): void {
    this.navigate.emit('recuperar');
  }

    goCliente(): void {
    this.navigate.emit('cli');
  }
}
