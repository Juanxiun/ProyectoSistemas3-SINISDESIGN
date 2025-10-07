// deno-lint-ignore-file no-sloppy-imports
import { Component, Input } from "@angular/core";
import { ProyData, ProyProps } from "../../../api/proyectos/poryData";
import { Title } from "@angular/platform-browser";
import { from, Observable } from "rxjs";
import { NgForOf, AsyncPipe, } from "@angular/common";


@Component({
  selector: "app-proy-info",
  imports: [ NgForOf, AsyncPipe],
  templateUrl: "./proy-info.html",
  styleUrl: "./proy-info.css",
})
export class ProyInfo {
  @Input()
  idproy: number = 0;
  @Input()
  usr: string = "";

  proyecto$!: Observable<ProyProps[]>;

  constructor(private titleService: Title) {}

  ngOnInit() {
    this.proyecto$ = from(ProyData(this.usr, this.idproy.toString()));
    this.proyecto$.subscribe((proyectos) => {
      if (proyectos && proyectos.length > 0) {
        this.titleService.setTitle("Proyecto: " + proyectos[0].nombre);
      }
    });
  }
}
