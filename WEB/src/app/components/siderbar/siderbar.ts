import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Options } from "../../elements/options/options";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-siderbar",
  standalone: true,
  imports: [Options, CommonModule],
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

  constructor(private router: Router) {}

  onCambiarVista(vista: "proyectos" | "reuniones"): void {
    this.cambiarVista.emit(vista);
  }

  onLogout(): void {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    this.router.navigate(['/login']);
  }
}