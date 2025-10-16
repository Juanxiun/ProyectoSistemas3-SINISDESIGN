// deno-lint-ignore-file no-sloppy-imports
import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/project/card-proy/card-proy";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Options } from "../../elements/options/options";
import { ProyInfo } from "../../components/project/proy-info/proy-info";
import { CalendarioComponent } from "../../components/calendario/calendario";
//añadido el import del calendario de reuniones
@Component({
  selector: "app-proyectos",
  imports: [CommonModule, Navbar, Siderbar, CardProy, Options, ProyInfo, CalendarioComponent],
  //añadido el import del calendario de reuniones
  templateUrl: "./proyectos.html",
  styleUrl: "./proyectos.css",
})
export class Proyectos implements OnInit {
  usr: string | null = null;
  idproy: number = 0;
  information: boolean = false;
  currentView: 'proyectos' | 'reuniones' = 'proyectos';//añadido la vista que se esta teniendo

  constructor(private route: ActivatedRoute) {}

  InformationProy(id: number) {
    this.idproy = id;

    if (this.idproy > 0) {
      this.information = true;
    }
  }

  salirInformacion() {
    this.information = false;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((parms) => {
      this.usr = parms.get("usr");
    });
  }
    //Añadido del cambio de vista al componente reuniones (calendario de reuniones)
   cambiarVista(view: 'proyectos' | 'reuniones'): void {
      this.currentView = view;
  }
}
