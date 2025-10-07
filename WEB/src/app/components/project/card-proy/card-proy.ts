// deno-lint-ignore-file no-sloppy-imports
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LoadDisplay } from "../../../elements/load-display/load-display";
import { from, Observable, of } from "rxjs";
import { ListProps, ListProyectos } from "../../../api/proyectos/list";
import { AsyncPipe, NgForOf } from "@angular/common";

@Component({
  selector: "app-card-proy",
  imports: [LoadDisplay, NgForOf, AsyncPipe],
  templateUrl: "./card-proy.html",
  styles: ``,
})
export class CardProy {
  @Input()
  usr: string = "";
  @Output()
  idproy = new EventEmitter<number>();

  proy$!: Observable<ListProps[]>;

  ngOnInit() {
    if (this.usr) {
      this.proy$ = from(ListProyectos(this.usr));
    } else {
      this.proy$ = of([]);
    }

    console.log(ListProyectos(this.usr));
  }

  EnviarId(id: number) {
    this.idproy.emit(id);
  }
}
