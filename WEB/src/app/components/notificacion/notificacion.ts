import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.html',
  styles: "",
})
export class NotificacionComponent implements OnInit, OnDestroy {
  @Input() type: 1 | 2 | 3 = 1; 
  @Input() Tittle: string = "";
  @Input() message: string = "";
  @Output() close = new EventEmitter<void>(); 

  private autoCloseTimer: any; 

  ngOnInit(): void {
    this.autoCloseTimer = setTimeout(() => {
      this.onClose();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  getBgClass(): string {
    switch (this.type) {
      case 1:
        return 'bg-green-500';
      case 2:
        return 'bg-blue-500'; 
      case 3:
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
