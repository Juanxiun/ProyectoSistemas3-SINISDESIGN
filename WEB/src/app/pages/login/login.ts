import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginForm } from "../../components/login-form/login-form";
import { RecuperarPass } from "../../components/recuperar-pass/recuperar-pass";
import { NuevoPass } from "../../components/nuevo-pass/nuevo-pass";
import { NotificacionComponent } from "../../components/notificacion/notificacion";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    LoginForm,
    RecuperarPass,
    NuevoPass,
    NotificacionComponent
  ],
  templateUrl: "./login.html",
  styleUrls: ["./login.css"],
})
export class Login {
  currentView: "form" | "recuperar" | "nuevo" = "form";
  notificationData: { type: 1 | 2 | 3; Tittle: string; message: string } | null = null;

  onNavigate(view: "form" | "recuperar" | "nuevo") {
    this.currentView = view;
  }

  onNotification(data: { type: 1 | 2 | 3; Tittle: string; message: string }) {
    this.notificationData = data;
  }
}
