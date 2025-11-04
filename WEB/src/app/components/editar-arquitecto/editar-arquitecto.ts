// components/editar-arquitecto/editar-arquitecto.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ConnectA } from '../../../config/index'; // ajusta la ruta si es necesario

export interface Arquitecto {
  codigo: string;
  nombre: string;
  apellido: string;
}

@Component({
  selector: 'app-editar-arquitecto',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './editar-arquitecto.html',
  styleUrls: ['./editar-arquitecto.css']
})
export class EditarArquitectoComponent implements OnInit {
  @Input() projectId!: number | string; // obligatorio que el padre le pase este valor
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  apiProyectos = `${ConnectA.api}/proyectos`;
  apiArquitectos = `${ConnectA.api}/arquitectos`;

  arquitectos: Arquitecto[] = [];
  proyecto: any = null;
  nuevoArq: string = '';
  loading = false;
  saving = false;
  mensaje = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.projectId) {
      this.mensaje = 'ID de proyecto no proporcionado.';
      return;
    }
    this.loadArquitectos();
    this.loadProyecto();
  }

  loadArquitectos(): void {
    this.http.get<any>(this.apiArquitectos).subscribe({
      next: (res) => {
        // compatibilidad con la forma en la que devuelve tu API
        if (res?.data?.data && Array.isArray(res.data.data)) {
          this.arquitectos = res.data.data;
        } else if (Array.isArray(res?.data)) {
          this.arquitectos = res.data;
        } else if (Array.isArray(res)) {
          this.arquitectos = res;
        } else {
          this.arquitectos = [];
        }
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar arquitectos.';
      }
    });
  }

  loadProyecto(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiProyectos}/${this.projectId}`).subscribe({
      next: (res) => {
        // normaliza respuesta
        const data = res?.data?.data ?? res?.data ?? res;
        this.proyecto = data;
        this.nuevoArq = this.proyecto?.arq ?? '';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.mensaje = `Error al cargar proyecto: ${err.status || ''} ${err.statusText || ''}`;
        this.loading = false;
      }
    });
  }

  onGuardar(): void {
    if (!this.nuevoArq) {
      this.mensaje = 'Selecciona un arquitecto.';
      return;
    }
    if (!this.proyecto?.id && !this.projectId) {
      this.mensaje = 'Proyecto no válido.';
      return;
    }

    this.saving = true;
    const payload = { arq: this.nuevoArq };
    this.http.patch<any>(`${this.apiProyectos}/${this.projectId}`, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.mensaje = 'Proyecto reasignado correctamente.';
        this.saved.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.mensaje = `Error al reasignar: ${err.status || ''} ${err.statusText || ''}`;
      }
    });
  }

  onCancelar(): void {
    this.cancel.emit();
  }

  // utilidad visual
  getNombreArquitecto(codigo: string): string {
    const a = this.arquitectos.find(ar => ar.codigo === codigo);
    return a ? `${a.nombre} ${a.apellido}` : codigo;
  }
}
