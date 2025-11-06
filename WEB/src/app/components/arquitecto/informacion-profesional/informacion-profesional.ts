

import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ConnectA } from '../../../../config/index';
import { Observable, throwError } from 'rxjs';

export interface Informacion {
  foto: string | null;
  universidad: string;
  titulacion: string;
  descripcion: string;
}

export interface ApiResponse<T> {
  data?: { data?: T, msg?: string };
}

@Component({
  selector: 'app-informacion-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './informacion-profesional.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformacionProfesional implements OnInit {
  @Input() arquitectoCodigo!: string;
  @Input() isEditing!: boolean;
  @Input() isLoading!: boolean;


  @Output() formChanged = new EventEmitter<boolean>();


  private get apiUrl() { return `${ConnectA.api}/arquitectos/${this.arquitectoCodigo}/informaciones`; }

  currentInfo: Partial<Informacion> = {
    foto: null,
    universidad: '',
    titulacion: '',
    descripcion: ''
  };
  originalInfo: Partial<Informacion> = {};
  isSaving = false;
  isValid = true;
  showForm = false;


  universidadError: string | null = null;
  titulacionError: string | null = null;
  descripcionError: string | null = null;
  fotoError: string | null = null;
  selectedFile: File | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }


  get displayPhotoSrc(): string | null {
    const fotoData = this.currentInfo.foto;

    if (!fotoData || typeof fotoData !== 'string' || fotoData.trim() === '') {
      return null;
    }

    if (fotoData.startsWith('data:')) {
      return fotoData;
    }

    return `data:image/jpeg;base64,${fotoData}`;
  }


  ngOnInit(): void {
    if (this.arquitectoCodigo) {
      this.fetchInformacion();
    }
  }
  public resetForm() {
    this.currentInfo = { ...this.originalInfo };
    this.selectedFile = null;
    this.validateForm();
  }
  fetchInformacion() {
    this.http.get<ApiResponse<Informacion>>(`${this.apiUrl}`).subscribe({
      next: (response: ApiResponse<Informacion>) => {
        const infoData = response.data && 'data' in response.data && Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data;

        if (infoData && 'universidad' in infoData) {
          let fotoBase64 = (infoData as Informacion).foto;


          if (fotoBase64 && typeof fotoBase64 !== 'string') {

            fotoBase64 = null;
          }

          this.currentInfo = {
            ...(infoData as Informacion),
            foto: fotoBase64 || null,
            titulacion: this.formatDateForInput((infoData as Informacion).titulacion)
          };
          this.originalInfo = { ...this.currentInfo };
          this.validateForm();
        }
        this.showForm = true;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.warn('No se encontró información profesional existente, cargando formulario de creación.');
        this.showForm = true;
        this.cdr.detectChanges();
      }
    });
  }


  private formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString;
    }
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateForm();

      const reader = new FileReader();
      reader.onload = () => {
        this.currentInfo.foto = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);

    } else {
      this.selectedFile = null;
      this.currentInfo.foto = this.originalInfo.foto ?? null;
      this.validateForm();
      this.cdr.detectChanges();
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.universidadError = null;
    this.titulacionError = null;
    this.descripcionError = null;
    this.fotoError = null;

    this.currentInfo.universidad = this.currentInfo.universidad?.trim() || '';
    this.currentInfo.descripcion = this.currentInfo.descripcion?.trim() || '';
    this.currentInfo.titulacion = this.currentInfo.titulacion?.trim() || '';


    if (!this.currentInfo.universidad) {
      this.universidadError = 'La universidad es obligatoria.';
      isValid = false;
    } else if (this.currentInfo.universidad.length > 50) {
      this.universidadError = 'La universidad no puede exceder 50 caracteres.';
      isValid = false;
    }


    if (!this.currentInfo.titulacion) {
      this.titulacionError = 'La fecha de titulación es obligatoria.';
      isValid = false;
    } else if (new Date(this.currentInfo.titulacion).toString() === 'Invalid Date') {
      this.titulacionError = 'Formato de fecha de titulación no válido.';
      isValid = false;
    } else if (new Date(this.currentInfo.titulacion) > new Date()) {
      this.titulacionError = 'Formato de fecha de titulación no puede ser una futura.';
      isValid = false;
    }


    if (!this.currentInfo.descripcion) {
      this.descripcionError = 'La descripción es obligatoria.';
      isValid = false;
    } else if (this.currentInfo.descripcion.length > 500) {
      this.descripcionError = 'La descripción no puede exceder 500 caracteres.';
    }

    if (this.selectedFile) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(this.selectedFile.type)) {
        this.fotoError = 'Solo se permiten archivos JPG, PNG o WEBP.';
        isValid = false;
      } else if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.fotoError = 'El archivo no debe exceder 5MB.';
        isValid = false;
      }
    }

    if (!this.currentInfo.foto && !this.selectedFile) {
      this.fotoError = 'La foto es obligatoria.';
      isValid = false;
    }


    this.isValid = isValid;

    this.formChanged.emit(isValid);
    this.cdr.detectChanges();
    return isValid;
  }

  public saveInformacion(): Observable<ApiResponse<any>> {

    if (!this.validateForm()) {
      return throwError(() => new Error('Error de validación: Por favor, corrija los campos marcados.'));
    }

    if (!this.arquitectoCodigo) {
      return throwError(() => new Error('Código de arquitecto ausente.'));
    }

    const formData = new FormData();

    formData.append('arq', this.arquitectoCodigo);
    formData.append('universidad', this.currentInfo.universidad!);
    formData.append('titulacion', this.currentInfo.titulacion!);
    formData.append('descripcion', this.currentInfo.descripcion!);


    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    } else {
      const origFoto = this.originalInfo?.foto;

      if (origFoto && typeof origFoto === 'string' && origFoto.trim() !== '') {

        formData.append('foto_base64', origFoto);
      }

    }

    return this.http.post<ApiResponse<any>>(this.apiUrl, formData);
  }

  cancelEdit() {
    this.currentInfo = { ...this.originalInfo };
    this.selectedFile = null;
    this.validateForm();
  }
}