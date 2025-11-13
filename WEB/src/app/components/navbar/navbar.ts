import { Component, EventEmitter, Input, Output, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Notification } from '../notification/notification';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ConnectA } from '../../../config/index';
interface Arquitecto {
  codigo?: string;
  nombre: string;
  apellido: string;
  correo: string;
  [key: string]: any;
}
interface Informacion {
  foto: string | null;
  universidad: string;
  titulacion: string;
  descripcion: string;
}
export interface ApiResponse<T> {
  data?: { data?: T | T[]; msg?: string; } | T;
  status?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, Notification, HttpClientModule],
  templateUrl: './navbar.html',
  styles: ''
})
export class Navbar implements OnDestroy, OnInit {
  @Input() id: string = "";
  @Input() Ubi: string = "";
  @Input() noResults: boolean = false;
  @Output() onSearch = new EventEmitter<string>();

  //cc
  userData: any;
  arquitecto: Arquitecto | null = null;
  arquitectoCodigo: string | null = null;
  isLoading = true;
  private apiUrl = `${ConnectA.api}/arquitectos`;
  // Usaremos esta URL para obtener la foto
  private get apiUrlInformacion() { return `${ConnectA.api}/arquitectos/${this.arquitectoCodigo}/informaciones`; }


  searchText: string = '';
  private searchSubject = new Subject<string>();

  arquitectoFotoSrc: string | null = null;

  get hasValidSearchText(): boolean {
    if (!this.searchText) return false;
    const normalized = this.searchText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '')
      .trim();
    return normalized.length > 0;
  }

  constructor(private router: Router, private cookieService: CookieService, private http: HttpClient,
    private cdr: ChangeDetectorRef) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.onSearch.emit(searchTerm);
    });
  }
  ngOnInit(): void {
    this.loadArquitectoFromSession();
  }


  handleInputChange() {
    this.searchSubject.next(this.searchText);
  }

  clearSearch() {
    this.searchText = '';
    this.onSearch.emit('');
  }
  goMiPerfil() {
    this.router.navigate(['/miPerfil']);
  }
  ngOnDestroy() {
    this.searchSubject.complete();
  }

  //VERIF arq y cargar el nombre y foto
  loadArquitectoFromSession() {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      try {
        this.userData = JSON.parse(cookieValue);
        console.log(this.userData);
      } catch (e) {
        console.error("Error al parsear cookie de sesión:", e);
        this.router.navigate(["/"]);
        return;
      }
    } else {
      this.router.navigate(["/"]);
      return;
    }

    if (!this.userData || !this.userData.id) {
      this.router.navigate(["/"]);
      return;
    }


    this.arquitectoCodigo = this.userData.id;


    if (this.arquitectoCodigo) {
      this.fetchArquitectoDetails(this.arquitectoCodigo);
      // cargar foto
      this.fetchInformacionProfesional(this.arquitectoCodigo);
    } else {
      this.isLoading = false;
    }
    this.cdr.detectChanges();
  }
  fetchArquitectoDetails(codigo: string) {
    this.isLoading = true;

    this.http.get<ApiResponse<Arquitecto>>(`${this.apiUrl}/${codigo}`).subscribe({
      next: (response: ApiResponse<Arquitecto>) => {
        const data = response.data && 'data' in response.data && Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data;

        if (data && 'codigo' in data) {
          this.arquitecto = data as Arquitecto;
        } else {
          this.arquitecto = null;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos del arquitecto:', err);
        this.isLoading = false;
        this.arquitecto = null;
        this.cdr.detectChanges();
      }
    });
  }

  fetchInformacionProfesional(codigo: string) {
    this.http.get<ApiResponse<Informacion>>(`${this.apiUrlInformacion}`).subscribe({
      next: (response: ApiResponse<Informacion>) => {
        const infoData = response.data && 'data' in response.data && Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data;

        if (infoData && 'foto' in infoData) {
          let fotoBase64 = (infoData as Informacion).foto;

          if (fotoBase64 && typeof fotoBase64 === 'string' && fotoBase64.trim() !== '') {

            if (fotoBase64.startsWith('data:')) {
              this.arquitectoFotoSrc = fotoBase64;

            } else {
              this.arquitectoFotoSrc = `data:image/jpeg;base64,${fotoBase64}`;

            }
          } else {
            this.arquitectoFotoSrc = null;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.warn('No se encontró información profesional con foto.');
        this.arquitectoFotoSrc = null;
        this.cdr.detectChanges();
      }
    });
  }
}