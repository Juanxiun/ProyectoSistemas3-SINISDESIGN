// deno-lint-ignore-file no-sloppy-imports
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { AuthService } from "../../middlewares/auth.service"; 

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: "./login-form.html",
  styleUrls: ["./login-form.css"],
})
export class LoginForm implements OnInit {
  @Output() navigate = new EventEmitter<"form" | "recuperar" | "nuevo">();
  @Output() notification = new EventEmitter<{ type: 1 | 2 | 3; Tittle: string; message: string }>();

  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage = "";

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      codigoUsuario: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          Validators.pattern(/^[A-Za-z0-9]+$/),
        ],
      ],
      contrasena: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
        ],
      ],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goRecuperar() {
  this.navigate.emit("recuperar");
  }
  
  goNuevo() {
    this.navigate.emit("nuevo");
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.notification.emit({
        type: 3,
        Tittle: "Error de validación",
        message: "Por favor corrige los campos en rojo.",
      });
      return;
    }

    const username = this.loginForm.value.codigoUsuario;
    const password = this.loginForm.value.contrasena;

    try {
      const usuario = await this.auth.login(username, password);

      // success notification
      this.notification.emit({
        type: 1,
        Tittle: "Inicio de sesión",
        message: "Inicio de sesión correcto. Redirigiendo...",
      });

      this.router.navigate(["/proyectos/"]);
    } catch (err: any) {
      console.error("Login error:", err);
      this.notification.emit({
        type: 3,
        Tittle: "Error de inicio de sesión",
        message: "Usuario o contraseña incorrecta.",
      });
    }
  }
}
