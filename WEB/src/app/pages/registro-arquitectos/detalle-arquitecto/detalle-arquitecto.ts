import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

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
    data?: {
        data?: T | T[];
        msg?: string;
    } | T;
    status?: number;
}


@Component({
    selector: 'app-detalle-arquitecto',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule],
    templateUrl: './detalle-arquitecto.html',
    styleUrl: './detalle-arquitecto.css',
})
export class DetalleArquitecto implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    private originalData: Arquitecto | undefined;
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
        console.log('ngOnInit DetalleArquitecto');
        this.route.paramMap.subscribe(params => {
            const codigo = params.get('codigo');
            console.log('Código recibido:', codigo);
            if (codigo) {
                this.arquitectoCodigo = codigo;
                this.fetchArquitectoDetails(codigo);
            } else {
                console.error('No se recibió código');
                this.router.navigate(['/registro-arquitectos']);
            }
        });
    }

    fetchArquitectoDetails(codigo: string) {
        console.log('Fetching detalles:', codigo);
        this.isLoading = true;

        this.http.get<ApiResponse<Arquitecto>>(`${this.apiUrl}/${codigo}`).subscribe({
            next: (response: ApiResponse<Arquitecto>) => {
                console.log('Respuesta API:', response);

                if (response.data && typeof response.data === 'object') {
                    if ('data' in response.data) {

                        const arquitectoData = Array.isArray(response.data.data)
                            ? response.data.data[0]
                            : response.data.data;

                        if (this.isArquitecto(arquitectoData)) {
                            this.arquitecto = arquitectoData;
                            // Guardar copia de los datos originales
                            this.originalData = { ...arquitectoData };
                            console.log('Arquitecto cargado:', this.arquitecto);
                        }
                    }
                }

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al cargar detalles:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private isArquitecto(data: any): data is Arquitecto {
        return data
            && typeof data === 'object'
            && 'ci' in data
            && 'nombre' in data
            && 'apellido' in data
            && 'telefono' in data
            && 'correo' in data;
    }
    toggleEdit() {
        if (this.isEditing) {

            this.resetForm();
        }
        this.isEditing = !this.isEditing;
    }
    resetForm() {
        if (this.originalData) {
            this.arquitecto = { ...this.originalData };
        }

        this.ciError = null;
        this.nombreError = null;
        this.apellidoError = null;
        this.telefonoError = null;
        this.correoError = null;
    }
    saveChanges() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;

        if (!this.validateForm()) return;

        this.isSaving = true;

        const fd = new FormData();
        fd.append('ci', String(this.arquitecto.ci));
        fd.append('nombre', String(this.arquitecto.nombre));
        fd.append('apellido', String(this.arquitecto.apellido || ''));
        fd.append('telefono', String(this.arquitecto.telefono || '0'));
        fd.append('correo', String(this.arquitecto.correo || ''));
        fd.append('admin', String(this.arquitecto.admin || 0));
        fd.append('estado', String(this.arquitecto.estado || 1));

        // NO poner headers Content-Type: el navegador lo asigna con boundary
        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, fd).subscribe({
            next: (response) => {
                alert(response.data?.msg || 'Arquitecto actualizado exitosamente!');
                this.isEditing = false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al guardar cambios:', err);
                alert('Error al actualizar: ' + (err.error?.data?.msg || err.message));
            },
            complete: () => {
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    deleteArquitecto() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;
        if (!confirm('¿Estás seguro de eliminar este arquitecto?')) return;

        this.isSaving = true;

        const fd = new FormData();
        fd.append('estado', '0');

        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, fd).subscribe({
            next: (response) => {
                alert(response.data?.msg || 'Arquitecto eliminado lógicamente.');
                this.router.navigate(['/registro-arquitectos']);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al eliminar:', err);
                alert('Error al eliminar: ' + (err.error?.data?.msg || err.message));
            },
            complete: () => {
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    //validaciones

    ciError: string | null = null;
    nombreError: string | null = null;
    apellidoError: string | null = null;
    telefonoError: string | null = null;
    correoError: string | null = null;
    onFieldChange(field: string) {
        if (!this.arquitecto) return;

        switch (field) {
            case 'ci':
                this.ciError = null;
                if (!this.arquitecto.ci) {
                    this.ciError = 'C.I. es obligatorio.';
                } else if (this.arquitecto.ci <= 0) {
                    this.ciError = 'C.I. debe ser un número positivo.';
                }
                break;

            case 'nombre':
                this.nombreError = null;
                if (!this.arquitecto.nombre) {
                    this.nombreError = 'Nombre es obligatorio.';
                } else if (this.arquitecto.nombre.length > 20) {
                    this.nombreError = 'Nombre no puede exceder 20 caracteres.';
                }
                break;

            case 'apellido':
                this.apellidoError = null;
                if (!this.arquitecto.apellido) {
                    this.apellidoError = 'Apellido es obligatorio.';
                } else if (this.arquitecto.apellido.length > 20) {
                    this.apellidoError = 'Apellido no puede exceder 20 caracteres.';
                }
                break;

            case 'telefono':
                this.telefonoError = null;
                if (!this.arquitecto.telefono) {
                    this.telefonoError = 'Teléfono es obligatorio.';
                } else if (this.arquitecto.telefono <= 0) {
                    this.telefonoError = 'Teléfono debe ser un número positivo.';
                }
                break;

            case 'correo':
                this.correoError = null;
                if (!this.arquitecto.correo) {
                    this.correoError = 'Correo es obligatorio.';
                } else if (!this.validateEmail(this.arquitecto.correo)) {
                    this.correoError = 'Correo no es válido.';
                }
                break;
        }
    }
    validateForm(): boolean {
        let isValid = true;
        this.ciError = null;
        this.nombreError = null;
        this.apellidoError = null;
        this.telefonoError = null;
        this.correoError = null;
        if (!this.arquitecto) {
            console.log('No hay arquitecto para validar');
            return false;
        }

        if (!this.arquitecto.ci) {
            this.ciError = 'C.I. es obligatorio.';
            isValid = false;
        } else if (this.arquitecto.ci <= 0) {
            this.ciError = 'C.I. debe ser un número positivo.';
            isValid = false;
        }

        if (!this.arquitecto.nombre) {
            this.nombreError = 'Nombre es obligatorio.';
            isValid = false;
        }
        if (this.arquitecto.nombre && this.arquitecto.nombre.length > 20) {
            this.nombreError = 'Nombre no puede exceder 20 caracteres.';
            isValid = false;
        }
        if (!this.arquitecto.apellido) {
            this.apellidoError = 'apellido es obligatorio.';
            isValid = false;
        }
        if (this.arquitecto.apellido && this.arquitecto.apellido.length > 20) {
            this.apellidoError = 'apellido no puede exceder 20 caracteres.';
            isValid = false;
        }

        if (this.arquitecto.telefono && this.arquitecto.telefono <= 0) {
            this.telefonoError = 'Teléfono debe ser un número positivo.';
            isValid = false;
        }
        if (!this.arquitecto.telefono) {
            this.telefonoError = 'telefono es obligatorio.';
            isValid = false;
        }


        if (this.arquitecto.correo && !this.validateEmail(this.arquitecto.correo)) {
            this.correoError = 'Correo no es válido.';
            isValid = false;
        }
        if (!this.arquitecto.correo) {
            this.correoError = 'Correo es obligatorio.';
            isValid = false;
        }

        return isValid;
    }

    validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    getFieldError(field: string): string | null {
        switch (field) {
            case 'ci':
                return this.ciError;
            case 'nombre':
                return this.nombreError;
            case 'apellido':
                return this.apellidoError;
            case 'telefono':
                return this.telefonoError;
            case 'correo':
                return this.correoError;
            default:
                return null;
        }
    }
}