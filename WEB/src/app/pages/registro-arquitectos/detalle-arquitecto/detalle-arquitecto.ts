import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';


import { Navbar } from '../../../components/navbar/navbar';
import { Siderbar } from '../../../components/siderbar/siderbar';
import { ConnectA } from '../../../../config/index';


export interface Arquitecto {
    codigo?: string;
    ci: number;
    nombre: string;
    apellido: string;
    telefono: number;
    correo: string;
    admin: number;
    password?: string;
    estado: number;
    [key: string]: string | number | undefined;
}

export interface ApiResponse<T> {
    data?: { data?: T, msg?: string } | T;
}


@Component({
    selector: 'app-detalle-arquitecto',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule],
    templateUrl: './detalle-arquitecto.html',
    styleUrl: './detalle-arquitecto.css',
})
export class DetalleArquitecto implements OnInit {
    private apiUrl = `${ConnectA.api}/arquitectos`;
    arquitectoCodigo: string | null = null;
    arquitecto: Arquitecto | undefined;
    isLoading = true;
    isSaving = false;
    isEditing = false;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.arquitectoCodigo = this.route.snapshot.paramMap.get('codigo');
        if (this.arquitectoCodigo) {
            this.fetchArquitectoDetails(this.arquitectoCodigo);
        } else {
            alert('Error: Código de arquitecto no proporcionado.');
            this.router.navigate(['/registro-arquitectos']);
        }
    }

    fetchArquitectoDetails(codigo: string) {
        this.isLoading = true;
        this.http.get<ApiResponse<Arquitecto>>(`${this.apiUrl}/${codigo}`).subscribe({
            next: (response: ApiResponse<Arquitecto>) => {

                let architectData = (response.data as any)?.data;


                if (!architectData && response.data && typeof response.data === 'object' && 'ci' in response.data) {
                    architectData = response.data;
                }

                this.arquitecto = architectData as Arquitecto;


                this.isLoading = false;

                if (!this.arquitecto) {
                    alert('Arquitecto no encontrado. El código podría ser inválido.');
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al obtener detalle:', err);
                alert('Error al cargar detalles del arquitecto. Revise la consola por errores de red (CORS).');
                this.router.navigate(['/registro-arquitectos']);
                this.isLoading = false;
            },

        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
    }

    saveChanges() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;

        if (!this.arquitecto.ci || !this.arquitecto.nombre) {
            alert('C.I. y Nombre son obligatorios.');
            return;
        }

        this.isSaving = true;

        const formData = new FormData();
        formData.append('ci', String(this.arquitecto.ci));
        formData.append('nombre', this.arquitecto.nombre);
        formData.append('apellido', this.arquitecto.apellido);
        formData.append('telefono', String(this.arquitecto.telefono || 0));
        formData.append('correo', this.arquitecto.correo);
        formData.append('admin', String(this.arquitecto.admin));
        formData.append('estado', String(this.arquitecto.estado));

        this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, formData).subscribe({
            next: (response: ApiResponse<any>) => {
                alert(response.data?.msg || 'Arquitecto actualizado exitosamente!');
                this.isEditing = false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al guardar cambios:', err);
                alert('Error al actualizar: ' + (err.error?.data?.msg || err.message));
            },
            complete: () => {
                this.isSaving = false;
            }
        });
    }

    deleteArquitecto() {
        if (!this.arquitecto || !confirm('¿Estás seguro de que deseas eliminar (lógicamente) a este arquitecto?')) return;

        this.isSaving = true;

        this.arquitecto.estado = 0;

        const formData = new FormData();
        formData.append('estado', '0');

        this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, formData).subscribe({
            next: (response: ApiResponse<any>) => {
                alert(response.data?.msg || 'Arquitecto eliminado lógicamente.');
                this.router.navigate(['/registro-arquitectos']);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al eliminar:', err);
                alert('Error al eliminar: ' + (err.error?.data?.msg || err.message));
            },
            complete: () => {
                this.isSaving = false;
            }
        });
    }
}