import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/project/card-proy/card-proy";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ProyInfo } from "../../components/project/proy-info/proy-info";
import { CookieService } from "ngx-cookie-service";

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

  ngOnInit(): void {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      console.log(this.userData);
    } else {
      this.router.navigate(["/"]);
    }
  }

  InformationProy(id: number) {
    this.idproy = id;
    this.information = this.idproy > 0;
  }

  salirInformacion() {
    this.information = false;
  }

  onSearchHandler(searchTerm: string) {
    console.log("Término de búsqueda recibido:", searchTerm);
    this.searchTerm = searchTerm;
    
    const normalized = this.normalizeSearchTerm(searchTerm);
    
    if (!normalized) {
      this.noResults = false;
    }
  }

  onResultsChange(hasResults: boolean) {
    const normalized = this.normalizeSearchTerm(this.searchTerm);
    
    if (!normalized) {
      this.noResults = false;
    } else {
      this.noResults = !hasResults;
    }
    
    console.log("No results:", this.noResults, "Search term:", this.searchTerm, "Has results:", hasResults);
  }

  private normalizeSearchTerm(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '')
      .trim();
  }

  goToCreate(id: string) {
    this.router.navigate(["registro-proyectos/crear/" + id]);
  }

  cambiarVista(view: "proyectos" | "reuniones" | "nueva-reunion"): void {
    this.currentView = view;
  }

  abrirNuevaReunion(): void {
    this.currentView = "nueva-reunion";
  }
}