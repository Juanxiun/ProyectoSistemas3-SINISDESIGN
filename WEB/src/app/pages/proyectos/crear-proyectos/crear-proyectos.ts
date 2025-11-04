import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from "@angular/common/http";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Observable } from "rxjs";

import { ConnectA } from "../../../../config/index";

import { Navbar } from "../../../components/navbar/navbar";
import { Siderbar } from "../../../components/siderbar/siderbar";

export interface Cliente {
  ci: number;
  nombre: string;
  apellido: string;
}

export interface Arquitecto {
  codigo: string;
  nombre: string;
  apellido: string;
}

export interface Proyecto {
  id?: number;
  arq: string;
  cli: number;
  nombre: string;
  inicio: string;
  costo: number;
  imagen?: string;
  est: number;
}

export interface ApiResponse<T> {
  data?: { data?: T; msg?: string; id?: number } | T;
  status?: number;
  std?: number;
  msg?: string;
  id?: number;
}

@Component({
  selector: "app-crear-proyectos",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    Navbar,
    Siderbar,
  ],
  templateUrl: "./crear-proyectos.html",
})
export class CrearProyectos implements OnInit {
  private apiUrlProyectos = `${ConnectA.api}/proyectos`;
  private apiUrlClientes = `${ConnectA.api}/clientes`;
  private apiUrlArquitectos = `${ConnectA.api}/arquitectos`;

  clientes = signal<Cliente[]>([]);
  arquitectos = signal<Arquitecto[]>([]);
  isLoading = signal(false);

  proyecto: Proyecto = {
    arq: "",
    cli: 0,
    nombre: "",
    inicio: "",
    costo: 0,
    est: 1,
  };

  imagenSeleccionada: File | null = null;
  nombreArchivo = "";
  previewImagen = "";
  mensajeError = "";
  mensajeExito = "";
  fechaActual: string = "";

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const codigoArq = this.route.snapshot.paramMap.get("arq") ??
      this.route.snapshot.queryParamMap.get("arq");
    this.fetchArchitects();
    this.fetchClients();
    this.setFechaHoraActual();
  }

  setFechaHoraActual(): void {
    const ahora = new Date();
    this.fechaActual = ahora.toISOString().slice(0, 16);
    this.proyecto.inicio = this.fechaActual;
  }

  fetchArquitectosApi(): Observable<ApiResponse<Arquitecto[]>> {
    return this.http.get<ApiResponse<Arquitecto[]>>(this.apiUrlArquitectos);
  }

  fetchClientesApi(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(this.apiUrlClientes);
  }

  fetchArchitects(): void {
    const codigoArq = this.route.snapshot.paramMap.get("arq") ??
      this.route.snapshot.queryParamMap.get("arq");

    if (!codigoArq) {
      this.mensajeError = "No se encontró el código de arquitecto.";
      return;
    }

    this.isLoading.set(true);
    this.fetchArquitectosApi().subscribe({
      next: (response: any) => {
        let list: Arquitecto[] = [];

        if (response?.data?.data && Array.isArray(response.data.data)) {
          list = response.data.data;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response)) {
          list = response;
        }

        const arqEncontrado = list.find((a) => a.codigo === codigoArq);

        if (arqEncontrado) {
          this.arquitectos.set([arqEncontrado]);
          this.proyecto.arq = arqEncontrado.codigo;
        } else {
          this.mensajeError = "No se encontró el arquitecto correspondiente.";
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = "Error al cargar los arquitectos: " +
          err.statusText;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  fetchClients(): void {
    this.isLoading.set(true);
    this.fetchClientesApi().subscribe({
      next: (response: any) => {
        let list: Cliente[] = [];

        if (response?.data?.data && Array.isArray(response.data.data)) {
          list = response.data.data;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response)) {
          list = response;
        }

        if (list.length === 0) {
          this.mensajeError = "No hay clientes disponibles";
        }

        this.clientes.set(list);
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError =
          `Error al cargar los clientes: ${err.status} ${err.statusText}`;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (!file.type.startsWith("image/")) {
        this.mensajeError =
          "Por favor selecciona una imagen válida (JPG, PNG, WebP)";
        this.imagenSeleccionada = null;
        this.nombreArchivo = "";
        this.previewImagen = "";
        return;
      }

      if (file.size > maxSizeBytes) {
        this.mensajeError = `La imagen no puede exceder ${maxSizeMB}MB`;
        this.imagenSeleccionada = null;
        this.nombreArchivo = "";
        this.previewImagen = "";
        return;
      }

      this.imagenSeleccionada = file;
      this.nombreArchivo = file.name;
      this.mensajeError = "";

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImagen = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    const cliNum = Number(this.proyecto.cli);
    const costoNum = Number(this.proyecto.costo);
    const nombreTrim = this.proyecto.nombre.trim();
    const regex = /^[a-zA-Z0-9\s\-\.\'\"\$\$\/:,]*$/;
    return (
      nombreTrim !== "" &&
      nombreTrim.length >= 3 &&
      nombreTrim.length <= 50 &&
      regex.test(this.proyecto.nombre) &&
      costoNum > 0 &&
      costoNum <= 9999999 &&
      !!this.proyecto.inicio &&
      cliNum !== 0 &&
      !!this.proyecto.arq &&
      this.proyecto.arq !== "" &&
      this.imagenSeleccionada !== null);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.mensajeError =
        "Por favor completa todos los campos correctamente y selecciona una imagen";
      return;
    }

    this.isLoading.set(true);
    this.mensajeError = "";
    this.mensajeExito = "";

    const formData = new FormData();
    formData.append("nombre", this.proyecto.nombre);
    formData.append("costo", this.proyecto.costo.toString());
    formData.append("inicio", this.proyecto.inicio);
    formData.append("cli", this.proyecto.cli.toString());
    formData.append("arq", this.proyecto.arq);
    formData.append("imagen", this.imagenSeleccionada!);


    this.http.post<ApiResponse<any>>(this.apiUrlProyectos, formData).subscribe({
      next: (response: any) => {        
        let idProyecto = null;
        
        if (response.id) {
          idProyecto = response.id;
        }
        else if (response.proyectoId) {
          idProyecto = response.proyectoId;
        }
        else if (response.data?.id) {
          idProyecto = response.data.id;
        }
        else if (response.data?.proyectoId) {
          idProyecto = response.data.proyectoId;
        }
        else if (response.data?.data?.id) {
          idProyecto = response.data.data.id;
        }

        const exitoso = response.std === 200 || response.status === 200;
        
        if (exitoso && idProyecto) {
          this.mensajeExito = "Proyecto creado exitosamente. Redirigiendo a completar detalles...";
          
          setTimeout(() => {
            this.router.navigate(['/detalle-proyectos', idProyecto], {
              queryParams: { 
                nuevo: 'true',
                arq: this.proyecto.arq 
              }
            });
          }, 1500);
        } else if (exitoso && !idProyecto) {
          // Proyecto creado pero sin ID
          console.warn("⚠ Proyecto creado pero no se obtuvo el ID");
          this.isLoading.set(false);
          this.mensajeError = "Proyecto creado pero no se pudo obtener el ID. Verifica en la lista de proyectos.";
          
          setTimeout(() => {
            this.goBack();
          }, 3000);
        } else {
          // Error en la creación
          console.error("✗ Error al crear el proyecto");
          this.isLoading.set(false);
          this.mensajeError = response?.msg || "Error al crear el proyecto";
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("=== FRONTEND: Error HTTP ===", err);
        this.isLoading.set(false);
        this.mensajeError = `Error ${err.status}: ${
          err.error?.msg || err.statusText
        }`;
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/proyectos/"]);
  }
}