import { Component, Input } from "@angular/core";

@Component({
  selector: "app-pag-info",
  imports: [],
  templateUrl: "./pag-info.html",
  styleUrl: "./pag-info.css",
})
export class PagInfo {
  @Input()
  idproy: number = 0;
}
