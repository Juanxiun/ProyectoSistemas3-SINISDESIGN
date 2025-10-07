import { Component } from '@angular/core';
import { Options } from "../../elements/options/options";

@Component({
  selector: 'app-siderbar',
  imports: [Options],
  templateUrl: './siderbar.html',
  styles: ``
})
export class Siderbar {
  proy = false;
  rep = false;
  reu = false;
  logout = false;
}
