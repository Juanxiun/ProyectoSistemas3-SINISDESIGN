import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ConnectA } from '../../../../config/index';

export interface Especializacion {
  id?: number;
  especialidad: string;
}

export interface ApiResponse<T> {
  data?: { data?: T, msg?: string };
}

@Component({
  selector: 'app-especializaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './especializaciones.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspecializacionesComponent implements OnInit {
  @Input() arquitectoCodigo!: string;
  @Input() isEditing!: boolean;
  @Input() isLoading!: boolean;

  @Output()
  notification = new EventEmitter<
    { type: 1 | 2 | 3; Tittle: string; message: string }
  >();

  private get apiUrl() { return `${ConnectA.api}/arquitectos/${this.arquitectoCodigo}/especializaciones`; }

  especializaciones: Especializacion[] = [];
  newEspecialidad: string = '';
  especialidadError: string | null = null;
  isSaving = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.arquitectoCodigo) {
      this.fetchEspecializaciones();
    }
  }

  fetchEspecializaciones() {

    this.isSaving = true;
    this.http.get<ApiResponse<Especializacion[]>>(this.apiUrl).subscribe({
      next: (response: ApiResponse<Especializacion[]>) => {
        const data = response.data && 'data' in response.data && Array.isArray(response.data.data)
          ? response.data.data
          : [];
        this.especializaciones = data as Especializacion[];
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.warn('Error al cargar especializaciones.', err);
        this.especializaciones = [];
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  validateNewEspecialidad(): boolean {
    this.especialidadError = null;
    this.newEspecialidad = this.newEspecialidad.trim();



    if (this.newEspecialidad.length > 25) {
      this.especialidadError = 'La especialidad no puede exceder 25 caracteres.';
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

    this.isSaving = true;

    const formData = new FormData();
    formData.append('especialidad', this.newEspecialidad);

    this.http.post<ApiResponse<any>>(this.apiUrl, formData).subscribe({
      next: (response: ApiResponse<any>) => {
        this.notification.emit({
          type: 1,
          Tittle: "Creación exitosa",
          message: "Especialidad agregada exitosamente!",
        });

        this.newEspecialidad = '';
        this.fetchEspecializaciones();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al agregar especialidad:', err);
        alert('Error al agregar: ' + (err.error?.data?.msg || err.message));
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeEspecialidad(id: number | undefined) {
    if (!this.isEditing || !id) return;
    if (!confirm('¿Estás seguro de eliminar esta especialidad?')) return;

    this.isSaving = true;
    const urlDelete = `${this.apiUrl}/${id}`;

    this.http.delete<ApiResponse<any>>(urlDelete).subscribe({
      next: (response: ApiResponse<any>) => {
        //alert(response.data?.msg || 'Especialidad eliminada exitosamente!');
        this.notification.emit({
          type: 1,
          Tittle: "Eliminación exitosa",
          message: "Especialidad eliminada exitosamente!",
        });
        this.fetchEspecializaciones();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al eliminar especialidad:', err);
        //alert('Error al eliminar: ' + (err.error?.data?.msg || err.message));
        this.notification.emit({
          type: 3, // Error
          Tittle: "Error de Validación",
          message: 'Error al eliminar: ' + (err.error?.data?.msg || err.message),
        });
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}