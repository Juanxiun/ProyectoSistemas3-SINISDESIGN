// deno-lint-ignore-file no-sloppy-imports
import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/project/card-proy/card-proy";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Options } from "../../elements/options/options";
import { ProyInfo } from "../../components/project/proy-info/proy-info";

@Component({
  selector: "app-proyectos",
  imports: [CommonModule, Navbar, Siderbar, CardProy, Options, ProyInfo],
  templateUrl: "./proyectos.html",
  styleUrl: "./proyectos.css",
})
export class Proyectos implements OnInit {
  usr: string | null = null;
  idproy: number = 0;
  information: boolean = false;
  searchTerm: string = '';
  noResults: boolean = false; 

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

  onSearchHandler(searchTerm: string) {
    console.log('Término de búsqueda:', searchTerm);
    this.searchTerm = searchTerm;
  }

  onResultsChange(hasResults: boolean) {
    this.noResults = !hasResults && this.searchTerm.length > 0;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((parms) => {
      this.usr = parms.get("usr");
    });
  }
}