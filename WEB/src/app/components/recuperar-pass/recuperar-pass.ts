import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar-pass.html',
  styleUrls: ['./recuperar-pass.css']
})
export class RecuperarPass {
  @Output() navigate = new EventEmitter<'cli' | 'arq' | 'recuperar' | 'nuevo'>();

  recuperarForm!: FormGroup;
  submitted = false;
  codigoGenerado: string = '123456'; // Simulación estática del código enviado

  constructor(private fb: FormBuilder) {
    this.recuperarForm = this.fb.group({
      correo: ['', [
        Validators.required,
        Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
      ]],
      codigo: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(8)
      ]]
    });
  }

  get f() {
    return this.recuperarForm.controls;
  }

  // Simulación del envío del código
  mandarCodigo(): void {
    const correo = this.recuperarForm.get('correo')?.value;

    if (!correo) {
      alert('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!correo.includes('@')) {
      alert('Por favor, ingresa un correo válido.');
      return;
    }

    // Simulación de envío de correo
    alert(`Se ha enviado un código de verificación al correo: ${correo}`);
  }

  // Verificación del código ingresado
  onSubmit(): void {
    this.submitted = true;

    if (this.recuperarForm.invalid) {
      console.warn('Formulario inválido');
      return;
    }

    const codigoIngresado = this.recuperarForm.get('codigo')?.value;
    if (codigoIngresado === this.codigoGenerado) {
      alert('Código verificado correctamente.');
      this.navigate.emit('nuevo');
    } else {
      alert('El código ingresado es incorrecto.');
    }
  }
}
