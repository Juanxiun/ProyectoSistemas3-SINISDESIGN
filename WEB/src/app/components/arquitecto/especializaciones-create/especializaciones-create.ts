import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Especializacion {
  especialidad: string;
}

@Component({
  selector: 'app-especializaciones-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especializaciones-create.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspecializacionesCreateComponent implements OnInit {

  @Input() isEditing: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() especializacionesChange = new EventEmitter<Especializacion[]>();

  especializaciones: Especializacion[] = [];
  newEspecialidad: string = '';
  especialidadError: string | null = null;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.emitData();
  }

  private emitData() {
    this.especializacionesChange.emit(this.especializaciones);
  }

  validateNewEspecialidad(): boolean {
    this.especialidadError = null;
    this.newEspecialidad = this.newEspecialidad.trim();

    if (!this.newEspecialidad) {
      this.especialidadError = 'La especialidad es obligatoria.';
      return false;
    }
    if (this.newEspecialidad.length > 100) {
      this.especialidadError = 'La especialidad no puede exceder 100 caracteres.';
      return false;
    }
    if (this.especializaciones.some(e => e.especialidad.toLowerCase() === this.newEspecialidad.toLowerCase())) {
      this.especialidadError = 'Esta especialidad ya ha sido agregada.';
      return false;
    }
    return true;
  }

  addEspecialidad() {
    if (!this.isEditing || !this.validateNewEspecialidad()) return;

    this.especializaciones.push({ especialidad: this.newEspecialidad });
    this.newEspecialidad = '';
    this.emitData();
    this.cdr.detectChanges();
  }

  removeEspecialidad(especialidad: string) {
    if (!this.isEditing) return;

    this.especializaciones = this.especializaciones.filter(e => e.especialidad !== especialidad);
    this.emitData();
    this.cdr.detectChanges();
  }
}