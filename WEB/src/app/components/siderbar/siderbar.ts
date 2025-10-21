import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Options } from "../../elements/options/options";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../middlewares/auth.service";

@Component({
  selector: "app-siderbar",
  standalone: true,
  imports: [Options, CommonModule],
  /* Añadido del import a CommonModule, y el StandAlone para la llamada a mi componente calendario */
  templateUrl: "./siderbar.html",
  styles: ``,
})
export class Siderbar {
  @Input() admin: number | undefined = undefined;
  proy = false;
  rep = false;
  reu = false;
  logout = false;

  @Output()
  cambiarVista = new EventEmitter<"proyectos" | "reuniones">();

  constructor(private authService: AuthService) {}

  onCambiarVista(vista: "proyectos" | "reuniones"): void {
    this.cambiarVista.emit(vista);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
