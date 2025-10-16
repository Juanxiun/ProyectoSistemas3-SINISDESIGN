import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
export class DocInfo implements OnInit {
  private fb = inject(FormBuilder);


  @Input({ required: true }) faseId!: string;

  documentos: DocumentoProps[] = [];
  documentoForm!: FormGroup;
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
      nombre: [doc?.nombre || '', Validators.required],
      tipo: [doc?.tipo || '', Validators.required],
      documento: [doc?.documento || null, Validators.required],
      fecha: [doc?.fecha.substring(0, 10) || defaultDate, Validators.required],
    });

    if (this.isEditMode) {
      this.documentoForm.get('documento')?.setValidators(null);
      this.documentoForm.get('documento')?.updateValueAndValidity();
    }
  }


  async cargarDocumentos() {

    if (!this.faseId) return;

    this.isLoading = true;
    try {
      this.documentos = await getDocumentosByFase(this.faseId);
    } catch (e) {
      console.error('Error al cargar documentos:', e);

      if (this.documentos.length === 0) {
        console.warn('La API devolvió un resultado vacío o con error.');
      }
    } finally {
      this.isLoading = false;
    }
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
    const formValue = this.documentoForm.value;

    try {
      const isSuccess = this.isEditMode
        ? await this.handleUpdate(formValue)
        : await this.handleCreate(formValue);

      if (isSuccess) {
        this.resetForm();
        await this.cargarDocumentos();
        alert(`Documento ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente.`);
      } else {
        alert(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} el documento. Revise la consola.`);
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
      tipo: formValue.tipo,
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
  }
}