import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/card-proy/card-proy";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../../environments/environment.development";
import { CommonModule } from "@angular/common";
import { from, map, Observable, of, switchMap } from "rxjs";

@Component({
  selector: "app-proyectos",
  imports: [CommonModule, Navbar, Siderbar, CardProy],
  templateUrl: "./proyectos.html",
  styleUrl: "./proyectos.css",
})
export class Proyectos implements OnInit {
  usr: string | null = null;
  url = environment.api;

  constructor(private route: ActivatedRoute) {}

  proy$!: Observable<ProyProps[]>;

  ngOnInit() {
    this.proy$ = this.route.paramMap.pipe(
      switchMap((parms) => {
        this.usr = parms.get("usr");
        return this.usr
          ? from(
            fetch(this.url + "/proyectos/" + this.usr).then((res) =>
              res.json()
            ),
          )
          : of([]);
      }),
      map((res: any) => (res.status === 200 ? res.data.data : [])),
    );
  }
}

export interface ProyProps {
  id: string;
  arq: string;
  cli: string;
  nombre: string;
  inicio: string;
  final: string;
  costo: string;
  imagen: string;
  est: string;
}
