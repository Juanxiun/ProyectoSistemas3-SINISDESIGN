import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { dateNotInFutureValidator } from '../../validators/dateValidator';
import { filesValidator } from '../../validators/filesValidator';

import DocumentoProps, {
  getDocumentosByFase,
  createDocumento,
  updateDocumento,
  deleteDocumento,
} from '../../api/documentos/faseDocumento';

@Component({
  selector: 'app-doc-info',

  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doc-info.html',

})
export class DocInfo implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);


  @Input({ required: true }) faseId!: string;

  documentos: DocumentoProps[] = [];

  documentoForm: FormGroup = this.fb.group({});
  isEditMode = false;
  selectedFile: File | null = null;
  isLoading = false;


  ngOnInit() {
    this.initForm();
    this.cargarDocumentos();

  }

  initForm(doc?: DocumentoProps) {
    const defaultDate = new Date().toISOString().substring(0, 10);

    this.documentoForm = this.fb.group({
      id: [doc?.id || null],
      fase: [parseInt(this.faseId), Validators.required],
      nombre: [doc?.nombre || '', [Validators.required, Validators.maxLength(50), filesValidator()]],
      documento: [doc?.documento || null, Validators.required],
      fecha: [
        { value: doc?.fecha?.substring(0, 10) || defaultDate, disabled: true },
        [Validators.required, dateNotInFutureValidator()]
      ],
    });

    if (this.isEditMode) {
      this.documentoForm.get('documento')?.setValidators(null);
      this.documentoForm.get('documento')?.updateValueAndValidity();
    }
  }
  getNombreErrorMessage(nomCampo: string) {
    let nombreControl: any;
    switch (nomCampo) {
      case 'nombre':

        nombreControl = this.documentoForm.get('nombre');
        if (nombreControl?.hasError('required')) {
          return 'El nombre es requerido (escriba algo).';
        }
        if (nombreControl?.hasError('maxlength')) {
          return 'El nombre no puede exceder los 50 caracteres.';
        }
        if (nombreControl?.hasError('forbiddenChars')) {
          return 'El nombre no puede contener los caracteres: \\ / : * ? " < > |';
        }
        return "el nombre no es valido";

      default:
        return "verifica el campo";



    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['faseId'] && this.faseId) {

      this.cargarDocumentos();
    }
  }

  async cargarDocumentos() {

    if (!this.faseId) return;

    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      this.documentos = await getDocumentosByFase(this.faseId);

    } catch (e) {
      console.error('Error al cargar documentos:', e);
      this.documentos = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
    this.resetForm();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    if (this.selectedFile) {
      this.documentoForm.get('documento')?.setValue(this.selectedFile.name);
    } else {
      this.documentoForm.get('documento')?.setValue(null);
    }
  }


  async onSubmit() {
    if (this.documentoForm.invalid) {
      alert('Formulario inválido. Revise los campos.');
      return;
    }

    this.isLoading = true;
    const formValue = this.documentoForm.getRawValue();
    try {
      const isSuccess = this.isEditMode
        ? await this.handleUpdate(formValue)
        : await this.handleCreate(formValue);

      if (isSuccess) {
        this.resetForm();
        await this.cargarDocumentos();
        alert(`Documento ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente.`);
      } else {
        alert(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} el documento.`);
      }
    } catch (e) {
      console.error("Fallo general en la operación:", e);
      alert(`Ocurrió un error inesperado al ${this.isEditMode ? 'actualizar' : 'crear'} el documento.`);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleCreate(formValue: any): Promise<boolean> {
    const file = this.selectedFile;
    if (!file) {
      alert('Debe seleccionar un archivo para crear el documento.');
      return false;
    }
    const dataToSend = { ...formValue, fase: formValue.fase };
    delete dataToSend.documento;

    return await createDocumento(dataToSend, file);
  }

  private async handleUpdate(formValue: any): Promise<boolean> {

    const documentoToUpdate: DocumentoProps = {
      id: formValue.id,
      fase: formValue.fase,
      nombre: formValue.nombre,
      tipo: "",
      fecha: formValue.fecha,
      documento: formValue.documento,
    };

    return await updateDocumento(documentoToUpdate, this.selectedFile || undefined);
  }



  editDocumento(documento: DocumentoProps) {
    this.isEditMode = true;
    this.selectedFile = null;
    this.initForm(documento);
  }


  async deleteDocumento(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este documento? Esta acción es irreversible.')) {
      this.isLoading = true;
      const isSuccess = await deleteDocumento(id);
      if (isSuccess) {
        await this.cargarDocumentos();
        alert('Documento eliminado exitosamente.');
      } else {
        alert('Error al eliminar el documento. Revise la consola.');
      }
      this.isLoading = false;
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedFile = null;
    this.initForm();
    console.log("Formulario reiniciado.")
  }

  downloadDocument(documento: DocumentoProps) {
    if (typeof documento.documento === 'string' && documento.documento.length > 0) {
      const link = document.createElement('a');
      link.href = documento.documento;
      const fileName = documento.nombre + '.' + documento.tipo;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No se encontró el contenido del documento para descargar.');
    }
  }
}