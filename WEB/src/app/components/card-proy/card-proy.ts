import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-proy',
  imports: [],
  templateUrl: './card-proy.html',
  styles: ``
})
export class CardProy {
  @Input() titulo: string = "";
  @Input() direccion: string = "";
  @Input() imagen: string = "";
}
