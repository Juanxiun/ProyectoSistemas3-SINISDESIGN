import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";

import { Options } from "../../elements/options/options";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../middlewares/auth.service";
import { CookieService } from "ngx-cookie-service";
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: "app-siderbar",
  standalone: true,
  imports: [Options, CommonModule, RouterModule],
  /* Añadido del import a CommonModule, y el StandAlone para la llamada a mi componente calendario */
  templateUrl: "./siderbar.html",
  styles: ``,
})
export class Siderbar implements OnInit {
  @Input() admin: number | undefined = undefined;
  proy = false;
  rep = false;
  reu = false;
  logout = false;
  userData: any = null;

  @Output()
  cambiarVista = new EventEmitter<"proyectos" | "reuniones">();

  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) { }
  ngOnInit(): void {
    // verificar sesion
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      console.log(this.userData);
    } else {
      this.router.navigate(["/"]);
    }
    this.admin = this.userData.admin;

  }
  onCambiarVista(vista: "proyectos" | "reuniones"): void {
    this.cambiarVista.emit(vista);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
