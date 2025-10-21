import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-options",
  imports: [NgClass],
  template: `
  <div (click)="nav()" (mouseenter)="hover = true" (mouseleave)="hover = false" class="flex flex-col items-center w-full cursor-pointer space-y-2.5 text-white">
      <i
          [ngClass]="hover ? 'bi text-3xl md:scale-200 scale-150 ' + initIcon : 'bi text-2xl md:scale-200 scale-125 '+ initIcon"></i>
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

  constructor(private router: Router) { }

  nav() {
    if (this.direction) {
      this.router.navigate([this.direction]);
    }
  }
}
