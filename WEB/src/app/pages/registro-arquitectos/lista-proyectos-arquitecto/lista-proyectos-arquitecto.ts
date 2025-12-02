import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { Navbar } from "../../../components/navbar/navbar";
import { Siderbar } from "../../../components/siderbar/siderbar";
import { CardProy } from "../../../components/project/card-proy/card-proy";
import { ProyInfo } from "../../../components/project/proy-info/proy-info";
import { NotificacionComponent } from "../../../components/notificacion/notificacion";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-lista-proyectos-arquitecto",
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    RouterModule,
    Siderbar,
    CardProy,
    ProyInfo,
    NotificacionComponent,
  ],
  templateUrl: "./lista-proyectos-arquitecto.html",
})
export class ListaProyectosArquitecto implements OnInit {
  idproy: number = 0;
  information: boolean = false;
  targetArqId: string = "";
  searchTerm: string = "";
  noResults: boolean = false;
  userData: any = null;

  mostrarNotif: boolean = false;
  tipoNotif: 1 | 2 | 3 = 1;
  mensajeNotif: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {

    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      if (this.userData.admin != 1) {
        this.router.navigate(["/"]);
        return;
      }
    } else {
      this.router.navigate(["/"]);
      return;
    }


    this.route.paramMap.subscribe(params => {
      this.targetArqId = params.get('id') ?? '';
      if (!this.targetArqId) {
        this.router.navigate(['/arquitectos']);
      }
    });
  }

  InformationProy(id: number) {
    this.idproy = id;
    this.information = this.idproy > 0;
  }

  salirInformacion() {
    this.information = false;
  }

  onSearchHandler(searchTerm: string) {
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
  }

  private normalizeSearchTerm(text: string): string {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, "")
      .trim();
  }

  goToCreate() {
    if (this.targetArqId) {
      this.router.navigate(["registro-proyectos/crear/" + this.targetArqId]);
    }
  }

  private mostrarNotificacion(tipo: 1 | 2 | 3, mensaje: string) {
    this.tipoNotif = tipo;
    this.mensajeNotif = mensaje;
    this.mostrarNotif = true;
    setTimeout(() => {
      this.mostrarNotif = false;
    }, 3000);
  }

  onProyectoEliminado(id: number) {
    this.mostrarNotificacion(1, "Proyecto eliminado exitosamente");
  }

  onProyectosCargados() {
    this.mostrarNotificacion(2, "Proyectos cargados");
  }

  irListadoPage() {
    this.router.navigate(['/arquitectos']);
  }

}