import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

// Componentes y Configuración existentes
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

    constructor(private http: HttpClient, private router: Router) { }


    validateForm(): boolean {
        if (!this.newArchitect.ci || !this.newArchitect.nombre) {
            alert('ERROR: C.I., Nombre  son obligatorios.');
            return false;
        }
        if (this.newArchitect.ci <= 0 || (this.newArchitect.telefono && this.newArchitect.telefono <= 0)) {
            alert('ERROR: Los campos numéricos no pueden ser cero o negativos.');
            return false;
        }
        return true;
    }

    submitNewArchitect() {
        if (!this.validateForm()) return;

        this.isLoading = true;
        const newArq = this.newArchitect as Arquitecto;

        const formData = new FormData();
        formData.append('codigo', newArq.codigo || '');
        formData.append('ci', String(newArq.ci));
        formData.append('nombre', newArq.nombre);
        formData.append('apellido', newArq.apellido);
        formData.append('telefono', String(newArq.telefono || 0));
        formData.append('correo', newArq.correo || '');
        formData.append('admin', String(newArq.admin));
        formData.append('estado', String(newArq.estado));

        this.http.post<ApiResponse<any>>(this.apiUrl, formData).subscribe({
            next: (response: ApiResponse<any>) => {
                alert(response.data?.msg || 'Arquitecto creado exitosamente!');
                this.router.navigate(['/registro-arquitectos']);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al crear arquitecto:', err);
                alert('Error al crear el arquitecto. Causa: ' + (err.error?.data?.msg || err.message || 'Error de conexión/servidor.'));
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }
}