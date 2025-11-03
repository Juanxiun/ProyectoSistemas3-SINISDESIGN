import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

//pruebas deteccion cambios sdafljk 
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

// Componentes existentess
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
}

export interface ApiResponse<T> {
    data?: { data?: T, msg?: string };
}



@Component({
    selector: 'app-crear-arquitecto',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule],
    templateUrl: './crear-arquitecto.html',
    styleUrl: './crear-arquitecto.css',
})
export class CrearArquitecto {
    private apiUrl = `${ConnectA.api}/arquitectos`;
    isLoading = false;
    isValid = false;

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

    constructor(private http: HttpClient,
        private router: Router,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef) { }


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
        this.newArchitect.codigo = this.newArchitect.codigo?.trim() || '';

        if (!this.newArchitect.ci) {
            this.ciError = 'C.I. es obligatorio.';
            isValid = false;
        } else if (this.newArchitect.ci.toString().length < 7 || this.newArchitect.ci.toString().length > 8) {
            this.ciError = 'La cantidad de digitos del C.I. debe ser entre 7 y 8.';
            isValid = false;
        }


        if (!this.newArchitect.codigo) {
            this.codigoError = 'codigo es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.codigo && this.newArchitect.codigo.length > 20) {
            this.codigoError = 'codigo no puede exceder 20 caracteres.';
            isValid = false;
        }


        if (!this.newArchitect.nombre) {
            this.nombreError = 'Nombre es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.nombre && this.newArchitect.nombre.length > 20) {
            this.nombreError = 'Nombre no puede exceder 20 caracteres.';
            isValid = false;
        }
        if (!this.newArchitect.apellido) {
            this.apellidoError = 'apellido es obligatorio.';
            isValid = false;
        }
        if (this.newArchitect.apellido && this.newArchitect.apellido.length > 20) {
            this.apellidoError = 'apellido no puede exceder 20 caracteres.';
            isValid = false;
        }


        if (!this.newArchitect.telefono) {
            this.telefonoError = 'telefono es obligatorio.';
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
        this.isValid = isValid;
        return isValid;
    }

    validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // hacerCodigo(arquitecto: Arquitecto) {

    //     const ranNum: number = Math.floor(Math.random() * 90) + 10;
    //     const segundoApellido: string = arquitecto.apellido.split(' ')[1] || '';
    //     const codigoFinal: string = arquitecto.nombre[0] + arquitecto.apellido[0] + segundoApellido[0] + arquitecto.ci + String(ranNum);
    //     return codigoFinal;
    // }
    submitNewArchitect() {
        if (!this.validateForm()) return;

        this.isLoading = true;
        const newArq = this.newArchitect as Arquitecto;

        const formData = new FormData();
        formData.append('codigo', String(newArq.codigo));
        formData.append('ci', String(newArq.ci));
        formData.append('nombre', newArq.nombre);
        formData.append('apellido', newArq.apellido);
        formData.append('telefono', String(newArq.telefono || 0));
        formData.append('correo', newArq.correo || '');
        formData.append('password', "12345678");
        formData.append('admin', String(newArq.admin));
        formData.append('estado', String(newArq.estado));

        this.http.post<ApiResponse<any>>(this.apiUrl, formData).subscribe({
            next: (response: ApiResponse<any>) => {
                if (response.data?.msg) {
                    alert(response.data.msg);
                    if (response.data.msg === 'Arquitecto creado exitosamente.') {
                        this.router.navigate(['/arquitectos']);
                    }
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al crear arquitecto:', err);
                // error especifico
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
                alert(errorMsg);
                this.isLoading = false;
                this.cdr.detectChanges();

            },
            complete: () => {


            }
        });
    }
}