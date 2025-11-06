// deno-lint-ignore-file no-sloppy-imports
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../middlewares/auth.service";
import { HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-login-arq",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: "./login-arq.html",
  styleUrls: ["./login-arq.css"],
})
export class LoginArq implements OnInit {
  @Output()
  navigate = new EventEmitter<"cli" | "arq" | "recuperar" | "nuevo">();

  @Output()
  goRecuperar = new EventEmitter<void>();

  @Output()
  notification = new EventEmitter<
    { type: 1 | 2 | 3; Tittle: string; message: string }
  >();

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage = "";

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      codigoUsuario: ["", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^[A-Za-z0-9]+$/), // solo letras y números
      ]],
      contrasena: ["", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
      ]],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.notification.emit({
        type: 3, // Error
        Tittle: "Error de Validación",
        message: "Por favor, corrige los errores en el formulario.",
      });
      return;
    }
    try {
      const user: any = await this.auth.login(
        this.loginForm.value.codigoUsuario,
        this.loginForm.value.contrasena,
      );
      // Éxito: emitir notificación y navegar
      this.notification.emit({
        type: 1, // Éxito
        Tittle: "Inicio de Sesión Exitoso",
        message: "Bienvenido, arquitecto.",
      });
      this.router.navigate(["/proyectos/"]);
    } catch (err) {
      // Error: emitir notificación
      this.notification.emit({
        type: 3, // Error
        Tittle: "Error de Inicio de Sesión",
        message: "Usuario o contraseña incorrecta.",
      });
      console.error(err);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRecuperarClick(): void {
    this.navigate.emit("recuperar");
  }

  goCliente(): void {
    this.navigate.emit("cli");
  }
}
