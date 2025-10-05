import { Component, OnInit } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { CardProy } from "../../components/card-proy/card-proy";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { from, map, Observable, of, switchMap } from "rxjs";
import { ConnectA } from "../../../config/index";

@Component({
  selector: "app-proyectos",
  imports: [CommonModule, Navbar, Siderbar, CardProy],
  templateUrl: "./proyectos.html",
  styleUrl: "./proyectos.css",
})
export class Proyectos implements OnInit {
  usr: string | null = null;
  url = ConnectA.api;

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
  id?: number;
  arq: string;
  nombre: string;
  costo: number;
  imagen: string;
  direccion: string;
  est: number;
}
