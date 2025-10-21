import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/project/card-proy/card-proy";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Options } from "../../elements/options/options";
import { ProyInfo } from "../../components/project/proy-info/proy-info";
import { CalendarioComponent } from "../../components/calendario/calendario";
import { NuevaReunionComponent } from "../../components/nueva-reunion/nueva-reunion";
//añadido el import del calendario de reuniones
@Component({
  selector: "app-proyectos",
  standalone: true,
  imports: [CommonModule, Navbar, Siderbar, CardProy, Options, ProyInfo, CalendarioComponent, NuevaReunionComponent],
  templateUrl: "./proyectos.html",
  styleUrls: ["./proyectos.css"],
})
export class Proyectos implements OnInit {
  usr: string | null = null;
  idproy: number = 0;
  information: boolean = false;
  currentView: 'proyectos' | 'reuniones' | 'nueva-reunion' = 'proyectos';
  searchTerm: string = '';
  noResults: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  InformationProy(id: number) {
    this.idproy = id;
    this.information = this.idproy > 0;
  }

  salirInformacion() {
    this.information = false;
  }

  onSearchHandler(searchTerm: string) {
    console.log('Término de búsqueda:', searchTerm);
    this.searchTerm = searchTerm;
  }

  onResultsChange(hasResults: boolean) {
    this.noResults = !hasResults && this.searchTerm.length > 0;
  }

  goToCreate() {
    this.router.navigate(['registro-proyectos/crear']);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.usr = params.get("usr");
    });
  }
    //Añadido del cambio de vista al componente reuniones (calendario de reuniones)
   cambiarVista(view: 'proyectos' | 'reuniones' | 'nueva-reunion'): void {
      this.currentView = view;
  }

  abrirNuevaReunion(): void {
    this.currentView = 'nueva-reunion';
  }
}
