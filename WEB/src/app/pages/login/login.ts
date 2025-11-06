// login.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginCli } from "../../components/login-cli/login-cli";
import { LoginArq } from "../../components/login-arq/login-arq";
import { RecuperarPass } from "../../components/recuperar-pass/recuperar-pass";
import { NuevoPass } from "../../components/nuevo-pass/nuevo-pass";
import { NotificacionComponent } from "../../components/notificacion/notificacion";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    LoginCli,
    LoginArq,
    RecuperarPass,
    NuevoPass,
    NotificacionComponent,
  ],
  templateUrl: "./login.html",
  styleUrls: ["./login.css"],
})
export class Login {
  currentView: "cli" | "arq" | "recuperar" | "nuevo" = "cli";
  notificationData: {type: 1 | 2 | 3, Tittle: string, message: string} | null = null; // Nueva propiedad

  // ... (métodos existentes)

  onNavigate(view: "cli" | "arq" | "recuperar" | "nuevo") {
    this.currentView = view;
  }

  // Nuevo método para manejar notificaciones
  onNotification(data: {type: 1 | 2 | 3, Tittle: string, message: string}) {
    this.notificationData = data;
  }
}