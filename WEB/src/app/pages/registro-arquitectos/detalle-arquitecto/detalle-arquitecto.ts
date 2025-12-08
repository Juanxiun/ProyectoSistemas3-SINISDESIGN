import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';


import { Navbar } from '../../../components/navbar/navbar';
import { Siderbar } from '../../../components/siderbar/siderbar';
import { ConnectA } from '../../../../config/index';

import { InformacionProfesional } from '../../../components/arquitecto/informacion-profesional/informacion-profesional';
import { EspecializacionesComponent } from '../../../components/arquitecto/especializaciones/especializaciones';

import { ViewChild } from '@angular/core';
import { CookieService } from "ngx-cookie-service";
import { NotificacionComponent } from "../../../components/notificacion/notificacion";

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
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule, InformacionProfesional, EspecializacionesComponent, NotificacionComponent,],
    templateUrl: './detalle-arquitecto.html',
    styleUrl: './detalle-arquitecto.css',
})
export class DetalleArquitecto implements OnInit {
    @ViewChild(InformacionProfesional) infoProfesionalComponent!: InformacionProfesional;
    private cdr = inject(ChangeDetectorRef);
    private originalData: Arquitecto | undefined;
    private apiUrl = `${ConnectA.api}/arquitectos`;
    arquitectoCodigo: string | null = null;
    arquitecto: Arquitecto | undefined;
    isLoading = true;
    isSaving = false;
    isEditing = false;
    isValid = true;
    userData: any = null;

    // Variables para Reestablecer Contraseña
    isResetting = false;
    showResetModal = false;
    newGeneratedPassword = '';

    //notis
    notificationData: { type: 1 | 2 | 3, Tittle: string, message: string } | null = null;


    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private cookieService: CookieService
    ) { }

    ngOnInit(): void {

        if (this.cookieService.check("sesion")) {
            const cookieValue = this.cookieService.get("sesion");
            this.userData = JSON.parse(cookieValue);
            console.log(this.userData);
        } else {
            this.router.navigate(["/"]);
        }
        if (!(this.userData && this.userData.admin === 1)) {
            this.router.navigate(["/"]);
        }
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

            this.infoProfesionalComponent.resetForm();
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
        this.codigoError = null;
    }

    saveChanges() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;
        if (!this.validateForm() || !this.infoProfesionalComponent.validateForm()) {
            this.onNotification({
                type: 3,
                Tittle: "Error de Validación",
                message: "Por favor, corrija los errores en la información del arquitecto y/o profesional.",
            });
            return;
        }
        this.isSaving = true;

        this.arquitecto.nombre = String(this.arquitecto.nombre)?.trim();
        this.arquitecto.apellido = String(this.arquitecto.apellido)?.trim();
        this.arquitecto.correo = String(this.arquitecto.correo)?.trim();
        this.arquitecto.codigo = String(this.arquitecto.codigo)?.trim();

        const fd = new FormData();
        fd.append('ci', String(this.arquitecto.ci));
        fd.append('codigo', String(this.arquitecto.codigo));
        fd.append('nombre', String(this.arquitecto.nombre));
        fd.append('apellido', String(this.arquitecto.apellido || ''));
        fd.append('telefono', String(this.arquitecto.telefono || '0'));
        fd.append('correo', String(this.arquitecto.correo || ''));
        fd.append('admin', String(this.arquitecto.admin || 0));
        fd.append('estado', String(this.arquitecto.estado || 1));

        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, fd).subscribe({
            next: (response) => {
                this.onNotification({
                    type: 1,
                    Tittle: "Actualización Exitosa",
                    message: "Arquitecto actualizado exitosamente!",
                });

                this.infoProfesionalComponent.saveInformacion().subscribe({
                    next: () => {
                        this.isEditing = false;
                        this.isSaving = false;
                        this.cdr.detectChanges();
                    },
                    error: (infoErr) => {
                        console.error('Error al guardar info profesional (hijo):', infoErr);
                        this.onNotification({
                            type: 3,
                            Tittle: "Error de actualización",
                            message: 'Error al actualizar info profesional: ' + (infoErr.error?.data?.msg || infoErr.message),
                        });
                        this.isSaving = false;
                        this.cdr.detectChanges();
                    }
                });

            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al guardar cambios (padre):', err);
                this.onNotification({
                    type: 3,
                    Tittle: "Error de actualización",
                    message: 'Error al actualizar: ' + (err.error?.data?.msg || err.message),
                });
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    deleteArquitecto() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;
        if (!confirm('¿Estás seguro de actualizar como inactivo a este arquitecto?')) return;

        this.isSaving = true;

        const fd = new FormData();
        fd.append('estado', '0');

        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, fd).subscribe({
            next: (response) => {
                this.onNotification({
                    type: 1,
                    Tittle: "Actualización Exitosa",
                    message: "Arquitecto desactivado exitosamente!",
                });
                alert(response.data?.msg || 'Arquitecto eliminado lógicamente.');
                this.router.navigate(['/arquitectos']);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al eliminar:', err);
                this.onNotification({
                    type: 3,
                    Tittle: "Error de actualización",
                    message: 'Error al eliminar: ' + (err.error?.data?.msg || err.message),
                });
                this.isSaving = false;
                this.cdr.detectChanges();
            },
            complete: () => {
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    activarArquitecto() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;
        if (!confirm('¿Estás seguro de activar a este arquitecto?')) return;

        this.isSaving = true;

        const fd = new FormData();
        fd.append('estado', '1');

        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, fd).subscribe({
            next: (response) => {
                this.onNotification({
                    type: 1,
                    Tittle: "Actualización Exitosa",
                    message: "Arquitecto activado exitosamente!",
                });
                alert(response.data?.msg || 'Arquitecto activado.');
                this.router.navigate(['/arquitectos']);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al activar:', err);
                this.onNotification({
                    type: 3,
                    Tittle: "Error de actualización",
                    message: 'Error al activar: ' + (err.error?.data?.msg || err.message),
                });
            },
            complete: () => {
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    // --- LÓGICA DE REESTABLECER CONTRASEÑA ---

    private generateRandomPassword(length: number = 10): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
        let password = "";
        // Aseguramos al menos un caracter especial
        password += "!@#$%&*".charAt(Math.floor(Math.random() * 7));

        for (let i = 1; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Mezclar
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    resetPassword() {
        if (!this.arquitecto || !this.arquitectoCodigo) return;

        const confirmacion = confirm(`¿Está seguro de reestablecer la contraseña para ${this.arquitecto.nombre}? Se generará una nueva automáticamente.`);
        if (!confirmacion) return;

        this.isResetting = true;
        const newPass = this.generateRandomPassword(10);

        // Enviamos solo la contraseña nueva al endpoint
        const body = { password: newPass };

        this.http.put<ApiResponse<any>>(`${this.apiUrl}/${this.arquitectoCodigo}`, body).subscribe({
            next: (response) => {
                this.isResetting = false;
                this.newGeneratedPassword = newPass;
                this.showResetModal = true; // Mostrar modal con la nueva pass

                this.onNotification({
                    type: 1,
                    Tittle: "Contraseña Reestablecida",
                    message: "Se ha generado una nueva contraseña correctamente.",
                });
                this.cdr.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                this.isResetting = false;
                console.error('Error al reestablecer contraseña:', err);
                this.onNotification({
                    type: 3,
                    Tittle: "Error",
                    message: "Error al reestablecer contraseña: " + (err.error?.msg || err.message)
                });
                this.cdr.detectChanges();
            }
        });
    }

    copyPass() {
        navigator.clipboard.writeText(this.newGeneratedPassword).then(() => {
            alert('Contraseña copiada al portapapeles');
        });
    }

    closeResetModal() {
        this.showResetModal = false;
        this.newGeneratedPassword = '';
        this.cdr.detectChanges();
    }


    ciError: string | null = null;
    nombreError: string | null = null;
    apellidoError: string | null = null;
    telefonoError: string | null = null;
    correoError: string | null = null;
    codigoError: string | null = null;

    onFieldChange(field: string) {

        this.validateForm();
        return this.isValid;
    }


    validateForm(): boolean {
        let isValid = true;
        this.ciError = null;
        this.nombreError = null;
        this.apellidoError = null;
        this.telefonoError = null;
        this.correoError = null;
        this.codigoError = null;

        if (!this.arquitecto) {
            console.log('No hay arquitecto para validar');
            this.isValid = false;
            return false;
        }


        this.arquitecto.nombre = String(this.arquitecto.nombre)?.trim();
        this.arquitecto.apellido = String(this.arquitecto.apellido)?.trim();
        this.arquitecto.correo = String(this.arquitecto.correo)?.trim();
        this.arquitecto.codigo = String(this.arquitecto.codigo)?.trim();

        if (!this.arquitecto.ci) {
            this.ciError = 'C.I. es obligatorio.';
            isValid = false;
        } else if (this.arquitecto.ci.toString().length < 7 || this.arquitecto.ci.toString().length > 8) {
            this.ciError = 'La cantidad de digitos del C.I. debe ser entre 7 y 8.';
            isValid = false;
        }


        if (!this.arquitecto.codigo) {
            this.codigoError = 'codigo es obligatorio.';
            isValid = false;
        }
        if (this.arquitecto.codigo && this.arquitecto.codigo.length > 20) {
            this.codigoError = 'codigo no puede exceder 20 caracteres.';
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


        if (!this.arquitecto.telefono) {
            this.telefonoError = 'telefono es obligatorio.';
            isValid = false;
        } else if (this.arquitecto.telefono && this.arquitecto.telefono.toString().length != 8) {
            this.telefonoError = 'Teléfono debe tener 8 digitos.';
            isValid = false;
        }


        if (!this.arquitecto.correo) {
            this.correoError = 'Correo es obligatorio.';
            isValid = false;
        } else if (this.arquitecto.correo && !this.validateEmail(this.arquitecto.correo)) {
            this.correoError = 'Correo no es válido.';
            isValid = false;
        }

        this.isValid = isValid;
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
            case 'codigo':
                return this.codigoError;
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

    //notis
    onNotification(data: { type: 1 | 2 | 3, Tittle: string, message: string }) {
        this.notificationData = data;
    }
}