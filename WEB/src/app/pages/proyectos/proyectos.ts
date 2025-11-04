// deno-lint-ignore-file no-sloppy-imports
import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/project/card-proy/card-proy";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ProyInfo } from "../../components/project/proy-info/proy-info";
import { CookieService } from "ngx-cookie-service";

//añadido el import del calendario de reuniones
@Component({
  selector: "app-proyectos",
  standalone: true,
  imports: [CommonModule, Navbar, Siderbar, CardProy, ProyInfo],
  templateUrl: "./proyectos.html",
  styleUrls: ["./proyectos.css"],
})
export class Proyectos implements OnInit {
  idproy: number = 0;
  information: boolean = false;
  currentView: "proyectos" | "reuniones" | "nueva-reunion" = "proyectos";
  searchTerm: string = "";
  noResults: boolean = false;
  userData: any = null;

  constructor(
    private router: Router,
    private cookieService: CookieService,
  ) {}

  InformationProy(id: number) {
    this.idproy = id;
    this.information = this.idproy > 0;
  }

  salirInformacion() {
    this.information = false;
  }

  onSearchHandler(searchTerm: string) {
    console.log("Término de búsqueda:", searchTerm);
    this.searchTerm = searchTerm;
  }

  onResultsChange(hasResults: boolean) {
    this.noResults = !hasResults && this.searchTerm.length > 0;
  }

  goToCreate(id: string) {
    this.router.navigate(["registro-proyectos/crear/" + id]);
  }

  ngOnInit(): void {
    
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      console.log(this.userData)
    } else {
      this.router.navigate(["/"])
    }
  }
  //Añadido del cambio de vista al componente reuniones (calendario de reuniones)
  cambiarVista(view: "proyectos" | "reuniones" | "nueva-reunion"): void {
    this.currentView = view;
  }

  abrirNuevaReunion(): void {
    this.currentView = "nueva-reunion";
  }
  
}
