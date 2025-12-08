import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { Navbar } from '../../../components/navbar/navbar';
import { Siderbar } from '../../../components/siderbar/siderbar';
import { ConnectA } from '../../../../config/index';
import { CookieService } from "ngx-cookie-service";

import { InformacionProfesionalCreateComponent, InfoProfesionalOutput, Informacion } from '../../../components/arquitecto/informacion-profesional-create/informacion-profesional-create';
import { EspecializacionesCreateComponent, Especializacion } from '../../../components/arquitecto/especializaciones-create/especializaciones-create';

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
}

export interface ApiResponse<T> {
    data?: { data?: T, msg?: string };
}

@Component({
    selector: 'app-crear-arquitecto',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule, InformacionProfesionalCreateComponent, EspecializacionesCreateComponent, NotificacionComponent], templateUrl: './crear-arquitecto.html',
    styleUrl: './crear-arquitecto.css',
})
export class CrearArquitecto implements OnInit {
    private apiUrl = `${ConnectA.api}/arquitectos`;
    isLoading = false;
    isValid = false;
    userData: any = null;

    // Variables para el Modal de Credenciales
    showCredentialsModal = false;
    createdCredentials = {
        nombre: '',
        codigo: '',
        password: ''
    };

    //notis
    notificationData: { type: 1 | 2 | 3, Tittle: string, message: string } | null = null;


    newArchitect: Partial<Arquitecto> = {
        ci: undefined,
        nombre: '',
        apellido: '',
        telefono: undefined,
        correo: '',
        password: '',
        admin: 0,
        estado: 1
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private cookieService: CookieService
    ) { }

    infoProfesionalData: Partial<Informacion> = {};
    infoProfesionalFile: File | null = null;
    isInfoProfesionalValid: boolean = false;
    especializaciones: Especializacion[] = [];

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
        this.validateForm();
        this.cdr.detectChanges();
    }

    onInfoProfesionalChange(event: InfoProfesionalOutput) {
        this.infoProfesionalData = event.info;
        this.infoProfesionalFile = event.file;
        this.isInfoProfesionalValid = event.isValid;
        this.validateForm();
    }

    onEspecializacionesChange(event: Especializacion[]) {
        this.especializaciones = event;
    }


    ciError: string | null = null;
    nombreError: string | null = null;
    apellidoError: string | null = null;
    telefonoError: string | null = null;
    correoError: string | null = null;
    codigoError: string | null = null;

    validateForm(): boolean {
        let isValid = true;
        this.ciError = null;
        this.nombreError = null;
        this.apellidoError = null;
        this.telefonoError = null;
        this.correoError = null;
        this.codigoError = null;

        this.newArchitect.nombre = this.newArchitect.nombre?.trim() || '';
        this.newArchitect.apellido = this.newArchitect.apellido?.trim() || '';
        this.newArchitect.correo = this.newArchitect.correo?.trim() || '';
        this.newArchitect.codigo = this.newArchitect.codigo?.trim() || ''; // Validar código manual

        if (!this.newArchitect.ci || isNaN(Number(this.newArchitect.ci))) {
            this.ciError = 'C.I. es obligatorio.';
            isValid = false;
        } else if (this.newArchitect.ci.toString().length < 7 || this.newArchitect.ci.toString().length > 8) {
            this.ciError = 'La cantidad de digitos del C.I. debe ser entre 7 y 8.';
            isValid = false;
        }

        // --- VALIDACIÓN DE CÓDIGO MANUAL RESTAURADA ---
        if (!this.newArchitect.codigo) {
            this.codigoError = 'codigo es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.codigo && this.newArchitect.codigo.length > 20) {
            this.codigoError = 'codigo no puede exceder 20 caracteres.';
            isValid = false;
        }
        // ----------------------------------------------

        if (!this.newArchitect.nombre) {
            this.nombreError = 'Nombre es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.nombre && this.newArchitect.nombre.length > 20) {
            this.nombreError = 'Nombre no puede exceder 20 caracteres.';
            isValid = false;
        }
        if (!this.newArchitect.apellido) {
            this.apellidoError = 'Apellido es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.apellido && this.newArchitect.apellido.length > 20) {
            this.apellidoError = 'Apellido no puede exceder 20 caracteres.';
            isValid = false;
        }


        if (!this.newArchitect.telefono) {
            this.telefonoError = 'Teléfono es obligatorio.';
            isValid = false;
        } else if (this.newArchitect.telefono && this.newArchitect.telefono.toString().length != 8) {
            this.telefonoError = 'Teléfono debe tener 8 digitos.';
            isValid = false;
        }

        if (this.newArchitect.correo && !this.validateEmail(this.newArchitect.correo)) {
            this.correoError = 'Correo no es válido.';
            isValid = false;
        }
        if (!this.newArchitect.correo) {
            this.correoError = 'Correo es obligatorio.';
            isValid = false;
        }

        if (!this.isInfoProfesionalValid) {
            isValid = false;
        }

        this.isValid = isValid;
        return isValid;
    }

    validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    private generateRandomPassword(length: number = 10): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
        let password = "";
        password += "!@#$%&*".charAt(Math.floor(Math.random() * 7));

        for (let i = 1; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    submitNewArchitect() {
        if (!this.validateForm()) return;

        this.isLoading = true;
        const newArq = this.newArchitect as Arquitecto;

        // GENERAR CONTRASEÑA AUTOMÁTICA
        const passwordGen = this.generateRandomPassword(10);

        const formData = new FormData();
        formData.append('codigo', String(newArq.codigo)); // Usamos el código manual
        formData.append('ci', String(newArq.ci));
        formData.append('nombre', newArq.nombre);
        formData.append('apellido', newArq.apellido);
        formData.append('telefono', String(newArq.telefono || 0));
        formData.append('correo', newArq.correo || '');
        formData.append('password', passwordGen); // Usamos la generada
        formData.append('admin', String(newArq.admin));
        formData.append('estado', String(newArq.estado));


        if (this.infoProfesionalData.universidad) formData.append('universidad', this.infoProfesionalData.universidad);
        if (this.infoProfesionalData.titulacion) formData.append('titulacion', this.infoProfesionalData.titulacion);
        if (this.infoProfesionalData.descripcion) formData.append('descripcion', this.infoProfesionalData.descripcion);
        if (this.infoProfesionalFile) {
            formData.append('foto', this.infoProfesionalFile);
        }

        formData.append('especializaciones', JSON.stringify(this.especializaciones.map(e => e.especialidad)));


        this.http.post<ApiResponse<any>>(this.apiUrl, formData).subscribe({
            next: (response: ApiResponse<any>) => {

                // Credenciales para el modal (Código manual + Password generada)
                this.createdCredentials = {
                    nombre: `${newArq.nombre} ${newArq.apellido}`,
                    codigo: String(newArq.codigo),
                    password: passwordGen
                };

                if (response.data?.msg) {
                    this.onNotification({
                        type: 2,
                        Tittle: "Información",
                        message: response.data.msg,
                    });

                    if (response.data.msg === 'Arquitecto creado exitosamente.' || response.data.msg.includes('exitosamente')) {
                        this.showCredentialsModal = true;
                    }
                    this.cdr.detectChanges();
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al crear arquitecto:', err);

                let errorMsg = 'Error al crear el arquitecto. ';
                if (err.error?.data?.msg) {
                    if (err.error.data.msg.includes('C.I.')) {
                        this.ciError = err.error.data.msg;
                    } else if (err.error.data.msg.includes('código')) {
                        this.codigoError = err.error.data.msg;
                    } else if (err.error.data.msg.includes('teléfono')) {
                        this.telefonoError = err.error.data.msg;
                    }
                    errorMsg += err.error.data.msg;
                } else {
                    errorMsg += 'Error de conexión/servidor.';
                }
                this.onNotification({
                    type: 2,
                    Tittle: "Información",
                    message: errorMsg,
                });
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            complete: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Contraseña copiada al portapapeles");
        });
    }

    closeModalAndRedirect() {
        this.showCredentialsModal = false;
        this.router.navigate(['/arquitectos']);
    }

    //notis
    onNotification(data: { type: 1 | 2 | 3, Tittle: string, message: string }) {
        this.notificationData = data;
    }
}