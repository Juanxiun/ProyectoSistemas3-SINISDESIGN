import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';


import { ConnectA } from '../../../config/index';

//components
import { Navbar } from '../../components/navbar/navbar';
import { Siderbar } from '../../components/siderbar/siderbar';

//int
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
    selector: 'app-registro-arquitectos',
    standalone: true,
    imports: [CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule],
    templateUrl: './registro-arquitectos.html',
    styleUrl: './registro-arquitectos.css',
})
export class RegistroArquitectos implements OnInit {
    private apiUrl = `${ConnectA.api}/arquitectos`;

    architects = signal<Arquitecto[]>([]);
    searchText = '';
    filteredArchitects = signal<Arquitecto[]>([]);
    isLoading = signal(false);

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        this.fetchArchitects();
    }

    fetchArquitectosApi(): Observable<ApiResponse<Arquitecto[]>> {
        return this.http.get<ApiResponse<Arquitecto[]>>(this.apiUrl);
    }

    fetchArchitects() {
        this.isLoading.set(true);
        this.fetchArquitectosApi().subscribe({
            next: (response: ApiResponse<Arquitecto[]>) => {
                const list: Arquitecto[] = response.data?.data || [];
                this.architects.set(list);
                this.applyFilter();
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al obtener arquitectos:', err);
                alert('Error al cargar la lista de arquitectos.');
            },
            complete: () => {
                this.isLoading.set(false);
            }
        });
    }

    applyFilter() {
        if (!this.searchText) {
            this.filteredArchitects.set(this.architects());
            return;
        }
        const lowerCaseSearch = this.searchText.toLowerCase();
        const results = this.architects().filter(
            (arq) =>
                arq.nombre.toLowerCase().includes(lowerCaseSearch) ||
                arq.apellido.toLowerCase().includes(lowerCaseSearch) ||
                String(arq.ci).includes(lowerCaseSearch) ||
                arq.correo.toLowerCase().includes(lowerCaseSearch) ||
                arq.codigo?.toLowerCase().includes(lowerCaseSearch)
        );
        this.filteredArchitects.set(results);
    }

    goToCreate() {
        this.router.navigate(['registro-arquitectos/crear']);
    }

    goToDetails(codigo: string | undefined) {
        if (codigo) {
            console.log('Navegando a detalles:', codigo);
            this.router.navigate(['registro-arquitectos/detalle', codigo]).then(() => {
                console.log('Navegación completada');
            }).catch(err => {
                console.error('Error en navegación:', err);
            });
        } else {
            alert('No se puede ver el detalle: Código no disponible.');
        }
    }
}