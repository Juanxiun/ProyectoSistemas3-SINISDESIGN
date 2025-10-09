import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-options",
  imports: [NgClass],
  template: `
  <div (mouseenter)="hover = true" (mouseleave)="hover = false" class="flex flex-row w-full md:space-x-7 lg:ml-10 md:ml-5 ml-2 cursor-pointer">
      <i
          [ngClass]="hover ? 'bi md:scale-200 scale-125 ' + hoverIcon : 'bi md:scale-200 scale-125 '+ initIcon"></i>
      <h3
          class="md:text-white text-transparent text-xl">{{ option }}</h3>
  </div>
  `,
  styles: ``,
})
export class Options {
  hover: boolean = false;
  @Input()
  initIcon = "";
  @Input()
  hoverIcon = "";
  @Input()
  option = "";
  @Input()
  direction = "";
}
