import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface Informacion {
  foto: string | null;
  universidad: string;
  titulacion: string;
  descripcion: string;
}

export interface InfoProfesionalOutput {
  info: Partial<Informacion>;
  file: File | null;
  isValid: boolean;
}

@Component({
  selector: 'app-informacion-profesional-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informacion-profesional-create.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformacionProfesionalCreateComponent implements OnInit {


  @Input() isLoading: boolean = false;

  @Output() infoDataChange = new EventEmitter<InfoProfesionalOutput>();

  currentInfo: Partial<Informacion> = {
    foto: null,
    universidad: '',
    titulacion: '',
    descripcion: ''
  };

  isValid = false;

  universidadError: string | null = null;
  titulacionError: string | null = null;
  descripcionError: string | null = null;
  fotoError: string | null = null;
  selectedFile: File | null = null;

  constructor(private cdr: ChangeDetectorRef) { }


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
    this.validateForm();
    this.emitData();
  }

  private emitData() {
    this.infoDataChange.emit({
      info: this.currentInfo,
      file: this.selectedFile,
      isValid: this.isValid
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.currentInfo.foto = reader.result as string;
        this.cdr.detectChanges();
        this.validateForm();
      };
      reader.readAsDataURL(this.selectedFile);

    } else {
      this.selectedFile = null;
      this.currentInfo.foto = null;
      this.validateForm();
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


    if (!this.currentInfo.foto && !this.selectedFile) {
      this.fotoError = 'La foto es obligatoria.';
      isValid = false;
    }


    this.isValid = isValid;
    this.emitData();
    this.cdr.detectChanges();
    return isValid;
  }
}