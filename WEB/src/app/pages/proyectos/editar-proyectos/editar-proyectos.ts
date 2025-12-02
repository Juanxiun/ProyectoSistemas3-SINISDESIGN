import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
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
  final?: string;
  costo: number;
  imagen?: string | File;
  est: number;
}

export interface TipoProyecto {
  id?: number;
  proy: number;
  tipo: string;
  subtipo: string;
}

export interface DireccionProyecto {
  id?: number;
  proy: number;
  pais: string;
  departamento: string;
  zona: string;
  calle: string;
  puerta: number;
}

export interface ApiResponse<T> {
  data?: { data?: T; msg?: string; id?: number } | T;
  status?: number;
  std?: number;
  msg?: string;
  id?: number;
}

@Component({
  selector: "app-editar-proyectos",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    Navbar,
    Siderbar,
  ],
  templateUrl: "./editar-proyectos.html",
})
export class EditarProyectos implements OnInit {
  private apiUrlProyectos = `${ConnectA.api}/proyectos`;
  private apiUrlClientes = `${ConnectA.api}/clientes`;
  private apiUrlArquitectos = `${ConnectA.api}/arquitectos`;
  private apiUrlTipos = `${ConnectA.api}/tipo-proyectos`;
  private apiUrlDirecciones = `${ConnectA.api}/direccion-proyectos`;

  clientes = signal<Cliente[]>([]);
  arquitectos = signal<Arquitecto[]>([]);
  isLoading = signal(false);
  proyectoId: number = 0;
  codigoArquitecto: string = "";
  nuevoArquitecto: string = '';
  userData: any = null;

  proyecto: Proyecto = {
    id: 0,
    arq: "",
    cli: 0,
    nombre: "",
    inicio: "",
    final: "",
    costo: 0,
    est: 1,
  };

  tipoProyecto: TipoProyecto = {
    proy: 0,
    tipo: "",
    subtipo: "",
  };

  direccion: DireccionProyecto = {
    proy: 0,
    pais: "Bolivia",
    departamento: "",
    zona: "",
    calle: "",
    puerta: 0,
  };

  imagenSeleccionada: File | null = null;
  nombreArchivo = "";
  previewImagen = "";
  imagenOriginal = "";
  mensajeError = "";
  mensajeExito = "";

  tieneTipo = false;
  tieneDireccion = false;
  seccionActual: "basico" | "tipo" | "direccion" | "reasignar" = "basico";

  serviciosCatalogo: { [key: string]: string[] } = {
    'Planes y legalizaciones de construcción': [
      'Viviendas',
      'Construcción comercial',
      'Lotes',
      'Masa edificada',
      'Terrenos',
      'Construcción industrial y equipamiento'
    ],
    'Servicios de lotes y terrenos': [
      'Partición y fusión de lotes',
      'Planos de asentamiento',
      'Urbanización nueva y actualización'
    ],
    'Asesoramiento técnico': [
      'Evaluación técnica',
      'Peritaje'
    ],
    'Dirección y administración de obras': [
      'Dirección',
      'Administración',
      'Fiscalización'
    ]
  };

  tiposDisponibles: string[] = [];
  subtiposDisponibles: string[] = [];

  erroresValidacion: { [key: string]: string } = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
  ) {}


ngOnInit(): void {
  if (this.cookieService.check("sesion")) {
    try {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      console.log("Usuario autenticado:", this.userData);
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      this.router.navigate(["/"]);
      return;
    }
  } else {
    console.warn("No hay sesión activa, redirigiendo...");
    this.router.navigate(["/"]);
    return;
  }
  
  this.tiposDisponibles = Object.keys(this.serviciosCatalogo);
  
  this.route.params.subscribe((params) => {
    this.proyectoId = +params["id"];
    if (!this.proyectoId) {
      this.mensajeError = "ID de proyecto no válido.";
      return;
    }
    this.proyecto.id = this.proyectoId;
    this.tipoProyecto.proy = this.proyectoId;
    this.direccion.proy = this.proyectoId;

    this.route.queryParams.subscribe((queryParams) => {
      this.codigoArquitecto = queryParams["arq"] || "";
      
      if (this.codigoArquitecto && this.proyectoId) {
        this.fetchClients();
        this.fetchArchitects();
        this.cargarProyecto();
        this.cargarTipo();
        this.cargarDireccion();
      } else {
        this.mensajeError = "Falta el código de arquitecto. Redirigiendo...";
        setTimeout(() => this.goBack(), 2000);
      }
    });
  });
}


  onTipoChange(): void {
    // Cuando cambia el tipo (categoría), actualizar los subtipos disponibles
    const tipoSeleccionado = this.tipoProyecto.tipo;
    this.subtiposDisponibles = this.serviciosCatalogo[tipoSeleccionado] || [];
    
    // Limpiar subtipo si el tipo seleccionado no contiene el subtipo actual
    if (!this.subtiposDisponibles.includes(this.tipoProyecto.subtipo)) {
      this.tipoProyecto.subtipo = '';
    }
    
    this.limpiarErrores('tipo');
    this.limpiarErrores('subtipo');
  }

  fetchArquitectosApi(): Observable<ApiResponse<Arquitecto[]>> {
    return this.http.get<ApiResponse<Arquitecto[]>>(this.apiUrlArquitectos);
  }

  fetchClientesApi(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(this.apiUrlClientes);
  }

  fetchArchitects(): void {
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

        this.arquitectos.set(list);
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = "Error al cargar los arquitectos: " + err.statusText;
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

        this.clientes.set(list);
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error al cargar los clientes: ${err.status} ${err.statusText}`;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  getNombreArquitectoActual(): string {
    const arquitecto = this.arquitectos().find(a => a.codigo === this.proyecto.arq);
    return arquitecto ? `${arquitecto.nombre} ${arquitecto.apellido}` : 'No asignado';
  }

  cargarProyecto(): void {
    this.isLoading.set(true);
    const url = `${this.apiUrlProyectos}/${this.codigoArquitecto}/${this.proyectoId}`;

    this.http.get<ApiResponse<Proyecto[]>>(url).subscribe({
      next: (response: any) => {
        let proyectos: Proyecto[] = [];

        if (response?.data?.data && Array.isArray(response.data.data)) {
          proyectos = response.data.data;
        } else if (Array.isArray(response?.data)) {
          proyectos = response.data;
        } else if (Array.isArray(response)) {
          proyectos = response;
        }

        if (proyectos.length > 0) {
          const proy = proyectos[0];
          
          this.proyecto = {
            ...proy,
            inicio: this.convertirFechaParaInput(proy.inicio),
            final: proy.final ? this.convertirFechaParaInput(proy.final) : "",
          };
          
          this.imagenOriginal = proy.imagen as string || "";
          this.previewImagen = proy.imagen as string || "";
        } else {
          this.mensajeError = "Proyecto no encontrado";
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error al cargar proyecto: ${err.status} ${err.statusText}`;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  convertirFechaParaInput(fecha: string): string {
    if (!fecha) return "";
    
    try {
      const mesesES: { [key: string]: string } = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
      };
      
      const fechaLimpia = fecha.trim().toLowerCase();
      const partes = fechaLimpia.split(',');
      
      if (partes.length < 2) {
        return "";
      }
      
      const fechaParte = partes[0].trim();
      const horaParte = partes[1].trim();
      
      const palabrasFecha = fechaParte.split(' ');
      
      let dia = '';
      let mesTexto = '';
      let anio = '';
      
      for (let i = 0; i < palabrasFecha.length; i++) {
        const palabra = palabrasFecha[i];
        
        if (!dia && /^\d+$/.test(palabra)) {
          dia = palabra.padStart(2, '0');
        }
        else if (!mesTexto && mesesES[palabra]) {
          mesTexto = mesesES[palabra];
        }
        else if (!anio && /^\d{4}$/.test(palabra)) {
          anio = palabra;
        }
      }
      
      if (!dia || !mesTexto || !anio) {
        return "";
      }
      
      let hora = '';
      let minutos = '';
      
      const partesHora = horaParte.split(' ');
      const tiempo = partesHora[0];
      const periodo = partesHora[1];
      
      if (tiempo && tiempo.includes(':')) {
        const [h, m] = tiempo.split(':');
        hora = h;
        minutos = m;
        
        if (periodo && periodo.startsWith('p')) {
          const horaNum = parseInt(hora);
          if (horaNum !== 12) {
            hora = (horaNum + 12).toString().padStart(2, '0');
          }
        } else if (periodo && periodo.startsWith('a')) {
          const horaNum = parseInt(hora);
          if (horaNum === 12) {
            hora = '00';
          } else {
            hora = hora.padStart(2, '0');
          }
        }
      }
      
      if (!hora || !minutos) {
        return "";
      }
      
      return `${anio}-${mesTexto}-${dia}T${hora.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
    } catch (error) {
      return "";
    }
  }

  cargarTipo(): void {
    const url = `${this.apiUrlTipos}?proy=${this.proyectoId}`;

    this.http.get<ApiResponse<TipoProyecto[]>>(url).subscribe({
      next: (response: any) => {
        let tipos: TipoProyecto[] = [];
        
        if (response?.data?.data && Array.isArray(response.data.data)) {
          tipos = response.data.data;
        } else if (Array.isArray(response?.data)) {
          tipos = response.data;
        } else if (Array.isArray(response)) {
          tipos = response;
        }

        if (tipos.length > 0) {
          this.tipoProyecto = { ...tipos[0] };
          this.tieneTipo = true;
          // Cargar subtipos correspondientes si existe un tipo
          if (this.tipoProyecto.tipo) {
            this.onTipoChange();
          }
        } else {
          this.tieneTipo = false;
        }
      },
      error: (err) => {
        if (err.status !== 404) {
          this.mensajeError = "Error al cargar el tipo de proyecto";
        }
      },
    });
  }

  reasignarArquitecto(): void {
  // Validación 1: campos básicos del proyecto
  if (!this.isFormBasicoValid()) {
    this.mostrarMensajeErrorTemporal("Por favor, completa correctamente la información básica antes de reasignar.");
    return;
  }

  // Validación 2: selección de nuevo arquitecto
  if (!this.nuevoArquitecto.trim()) {
    this.mostrarMensajeErrorTemporal("Por favor, selecciona un arquitecto para reasignar.");
    return;
  }

  // Validación 3: arquitecto diferente
  if (this.nuevoArquitecto.trim() === this.proyecto.arq) {
    this.mostrarMensajeErrorTemporal("El nuevo arquitecto debe ser diferente al actual.");
    return;
  }

  // Validación 4: arquitecto existente en la lista
  const arquitectoExiste = this.arquitectos().some(a => a.codigo === this.nuevoArquitecto.trim());
  if (!arquitectoExiste) {
    this.mostrarMensajeErrorTemporal("El arquitecto seleccionado no existe en la lista.");
    return;
  }

  // --- Si todo está correcto ---
  this.isLoading.set(true);
  this.mensajeError = "";
  this.mensajeExito = "";

  const formData = new FormData();
  formData.append("nombre", this.proyecto.nombre.trim());
  formData.append("costo", this.proyecto.costo.toString());
  formData.append("inicio", this.proyecto.inicio);
  formData.append("cli", this.proyecto.cli.toString());
  formData.append("arq", this.nuevoArquitecto.trim());
  formData.append("est", this.proyecto.est.toString());

  if (this.proyecto.final && this.proyecto.final.trim() !== "") {
    formData.append("final", this.proyecto.final);
  }

  if (this.imagenSeleccionada && this.imagenSeleccionada instanceof File) {
    formData.append("imagen", this.imagenSeleccionada, this.imagenSeleccionada.name);
  }

  this.http.put<any>(`${this.apiUrlProyectos}/${this.proyectoId}`, formData).subscribe({
    next: (response: any) => {
      if (response.std === 200 || response.status === 200) {
        this.mensajeExito = "Arquitecto reasignado correctamente.";
        this.proyecto.arq = this.nuevoArquitecto;

        // Limpiar selección de imagen y mensaje
        this.imagenSeleccionada = null;
        this.nombreArchivo = "";
        setTimeout(() => {
          this.mensajeExito = "";
        }, 3000);
      } else {
        this.mensajeError = response?.error || response?.msg || "Error al reasignar arquitecto.";
      }
    },
    error: (err: HttpErrorResponse) => {
      let mensajeError = `Error ${err.status}: `;
      if (err.error?.error) mensajeError += err.error.error;
      else if (err.error?.msg) mensajeError += err.error.msg;
      else mensajeError += err.statusText || "Error desconocido.";
      this.mensajeError = mensajeError;
    },
    complete: () => {
      this.isLoading.set(false);
    },
  });
}

  cargarDireccion(): void {
    const url = `${this.apiUrlDirecciones}?proy=${this.proyectoId}`;

    this.http.get<ApiResponse<DireccionProyecto[]>>(url).subscribe({
      next: (response: any) => {
        let direcciones: DireccionProyecto[] = [];
        
        if (response?.data?.data && Array.isArray(response.data.data)) {
          direcciones = response.data.data;
        } else if (Array.isArray(response?.data)) {
          direcciones = response.data;
        } else if (Array.isArray(response)) {
          direcciones = response;
        }

        if (direcciones.length > 0) {
          this.direccion = { ...direcciones[0] };
          this.tieneDireccion = true;
        } else {
          this.tieneDireccion = false;
        }
      },
      error: (err) => {
        if (err.status !== 404) {
          this.mensajeError = "Error al cargar la dirección del proyecto";
        }
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
        this.mensajeError = "Por favor selecciona una imagen válida (JPG, PNG, WebP)";
        this.resetImagen();
        return;
      }

      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        this.mensajeError = "Formato no soportado. Use JPG, PNG o WebP";
        this.resetImagen();
        return;
      }

      if (file.size > maxSizeBytes) {
        this.mensajeError = `La imagen no puede exceder ${maxSizeMB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
        this.resetImagen();
        return;
      }

      if (file.size < 1024) {
        this.mensajeError = "La imagen es demasiado pequeña";
        this.resetImagen();
        return;
      }

      this.imagenSeleccionada = file;
      this.nombreArchivo = file.name;
      this.mensajeError = "";

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImagen = e.target?.result as string;
      };
      reader.onerror = (error) => {
        this.mensajeError = "Error al cargar la imagen";
        this.resetImagen();
      };
      reader.readAsDataURL(file);
    }

    
  }

  private resetImagen(): void {
    this.imagenSeleccionada = null;
    this.nombreArchivo = "";
    this.previewImagen = this.imagenOriginal;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  eliminarImagen(): void {
    this.imagenSeleccionada = null;
    this.nombreArchivo = "";
    this.previewImagen = "";
    this.imagenOriginal = "";
    
    this.mensajeExito = "Imagen eliminada. Guarda los cambios para aplicar.";
    setTimeout(() => {
      this.mensajeExito = "";
    }, 3000);
  }

  // Validaciones de texto
  validarTextoSoloLetras(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    
    // Permitir solo letras, espacios, tildes y ñ
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/;
    
    if (!regex.test(valor)) {
      const valorLimpio = valor.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
      input.value = valorLimpio;
      
      if (campo === 'departamento') {
        this.direccion.departamento = valorLimpio;
      }
    }
  }

  validarTextoConNumeros(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    
    // Permitir letras, números, espacios, punto, coma y guion
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,\-]*$/;
    
    if (!regex.test(valor)) {
      const valorLimpio = valor.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,\-]/g, '');
      input.value = valorLimpio;
      
      if (campo === 'zona') {
        this.direccion.zona = valorLimpio;
      } else if (campo === 'calle') {
        this.direccion.calle = valorLimpio;
      }
    }
  }

  validarNumeroPuerta(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    
    // Permitir solo números
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    input.value = soloNumeros;
    
    // Convertir a número
    const numero = parseInt(soloNumeros);
    
    if (soloNumeros === '' || isNaN(numero)) {
      this.direccion.puerta = 0;
      this.erroresValidacion['puerta'] = 'El número de puerta es requerido';
      return;
    }
    
    if (numero < 1) {
      this.erroresValidacion['puerta'] = 'El número de puerta debe ser mayor a 0';
      return;
    }
    
    if (numero > 99999) {
      // En lugar de cambiar el valor, mostramos un error
      this.erroresValidacion['puerta'] = 'El número de puerta no puede ser mayor a 99999';
      return;
    }
    
    this.direccion.puerta = numero;
    this.limpiarErrores('puerta');
  }

  // Validaciones específicas para dirección
  validarDepartamento(): void {
    const valor = this.direccion.departamento.trim();
    
    if (!valor) {
      this.erroresValidacion['departamento'] = 'El departamento es requerido';
      return;
    }
    
    if (valor.length < 3) {
      this.erroresValidacion['departamento'] = 'El departamento debe tener al menos 3 caracteres';
      return;
    }
    
    if (valor.length > 50) {
      this.erroresValidacion['departamento'] = 'El departamento no puede tener más de 50 caracteres';
      return;
    }
    
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    if (!regex.test(valor)) {
      this.erroresValidacion['departamento'] = 'El departamento solo puede contener letras y espacios';
      return;
    }
    
    this.limpiarErrores('departamento');
  }

  validarZona(): void {
    const valor = this.direccion.zona.trim();
    
    if (!valor) {
      this.erroresValidacion['zona'] = 'La zona es requerida';
      return;
    }
    
    if (valor.length < 2) {
      this.erroresValidacion['zona'] = 'La zona debe tener al menos 2 caracteres';
      return;
    }
    
    if (valor.length > 100) {
      this.erroresValidacion['zona'] = 'La zona no puede tener más de 100 caracteres';
      return;
    }
    
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,\-]+$/;
    if (!regex.test(valor)) {
      this.erroresValidacion['zona'] = 'La zona solo puede contener letras, números y caracteres básicos (. , -)';
      return;
    }
    
    this.limpiarErrores('zona');
  }

  validarCalle(): void {
    const valor = this.direccion.calle.trim();
    
    if (!valor) {
      this.erroresValidacion['calle'] = 'La calle es requerida';
      return;
    }
    
    if (valor.length < 3) {
      this.erroresValidacion['calle'] = 'La calle debe tener al menos 3 caracteres';
      return;
    }
    
    if (valor.length > 150) {
      this.erroresValidacion['calle'] = 'La calle no puede tener más de 150 caracteres';
      return;
    }
    
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,\-]+$/;
    if (!regex.test(valor)) {
      this.erroresValidacion['calle'] = 'La calle solo puede contener letras, números y caracteres básicos (. , -)';
      return;
    }
    
    this.limpiarErrores('calle');
  }

  validarPuerta(): void {
    const valor = this.direccion.puerta;
    
    if (!valor || valor < 1) {
      this.erroresValidacion['puerta'] = 'El número de puerta debe ser mayor a 0';
      return;
    }
    
    if (valor > 99999) {
      this.erroresValidacion['puerta'] = 'El número de puerta no puede ser mayor a 99999';
      return;
    }
    
    this.limpiarErrores('puerta');
  }

  mostrarMensajeErrorTemporal(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      if (this.mensajeError === mensaje) {
        this.mensajeError = '';
      }
    }, 3000);
  }

  limpiarErrores(campo: string): void {
    if (this.erroresValidacion[campo]) {
      delete this.erroresValidacion[campo];
    }
  }

  tieneError(campo: string): boolean {
    return !!this.erroresValidacion[campo];
  }

  isFormBasicoValid(): boolean {
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
      this.proyecto.arq !== ""
    );
  }

  isTipoFormValid(): boolean {
    return (
      this.tipoProyecto.tipo.trim() !== "" &&
      this.tipoProyecto.subtipo.trim() !== ""
    );
  }

  isDireccionFormValid(): boolean {
    return (
      this.direccion.pais.trim() !== "" &&
      this.direccion.departamento.trim() !== "" &&
      this.direccion.departamento.trim().length >= 3 &&
      this.direccion.zona.trim() !== "" &&
      this.direccion.zona.trim().length >= 2 &&
      this.direccion.calle.trim() !== "" &&
      this.direccion.calle.trim().length >= 3 &&
      this.direccion.puerta > 0 &&
      this.direccion.puerta <= 99999 &&
      Object.keys(this.erroresValidacion).length === 0
    );
  }

onSubmitBasico(): void {
  if (!this.isFormBasicoValid()) {
    this.mensajeError = "Por favor completa todos los campos correctamente";
    return;
  }

  this.isLoading.set(true);
  this.mensajeError = "";
  this.mensajeExito = "";

  const formData = new FormData();
  formData.append("nombre", this.proyecto.nombre.trim());
  formData.append("costo", this.proyecto.costo.toString());
  formData.append("inicio", this.proyecto.inicio);
  formData.append("cli", this.proyecto.cli.toString());
  formData.append("arq", this.proyecto.arq);
  formData.append("est", this.proyecto.est.toString());

  if (this.proyecto.final && this.proyecto.final.trim() !== "") {
    formData.append("final", this.proyecto.final);
  }

  if (this.imagenSeleccionada && this.imagenSeleccionada instanceof File) {
    formData.append("imagen", this.imagenSeleccionada, this.imagenSeleccionada.name);
  }

  this.http
    .put<any>(
      `${this.apiUrlProyectos}/${this.proyectoId}`,
      formData
    )
    .subscribe({
      next: (response: any) => {
        if (response.std === 200 || response.status === 200) {
          this.mensajeExito = "Información básica actualizada correctamente";
          
          if (this.imagenSeleccionada) {
            this.imagenOriginal = this.previewImagen;
          }
          
          this.imagenSeleccionada = null;
          this.nombreArchivo = "";
          
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          
          if (this.imagenSeleccionada !== null) {
            setTimeout(() => {
              this.cargarProyecto();
            }, 500);
          }
          
          setTimeout(() => {
            this.mensajeExito = "";
          }, 3000);
        } else {
          this.mensajeError = response?.error || response?.msg || "Error al actualizar el proyecto";
        }
      },
      error: (err: HttpErrorResponse) => {
        let mensajeError = `Error ${err.status}: `;
        if (err.error?.error) {
          mensajeError += err.error.error;
        } else if (err.error?.msg) {
          mensajeError += err.error.msg;
        } else {
          mensajeError += err.statusText || 'Error desconocido';
        }
        
        this.mensajeError = mensajeError;
        
        if (err.status === 400 && err.error?.error?.toLowerCase().includes('imagen')) {
          this.mensajeError += ". Por favor, selecciona una imagen válida (JPG, PNG, WebP, máximo 5MB)";
        }
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
}

  guardarTipo(): void {
    if (!this.isTipoFormValid()) {
      this.mensajeError = "Por favor completa todos los campos del tipo de proyecto";
      return;
    }

    this.isLoading.set(true);
    this.mensajeError = "";
    this.mensajeExito = "";

    const formData = new FormData();
    formData.append("proy", this.tipoProyecto.proy.toString());
    formData.append("tipo", this.tipoProyecto.tipo.trim());
    formData.append("subtipo", this.tipoProyecto.subtipo.trim());

    const request = this.tieneTipo
      ? this.http.put<any>(`${this.apiUrlTipos}/${this.tipoProyecto.id}`, formData)
      : this.http.post<any>(this.apiUrlTipos, formData);

    request.subscribe({
      next: (response: any) => {
        if (response.std === 200 || response.status === 200) {
          this.tieneTipo = true;
          this.mensajeExito = "Tipo de proyecto guardado correctamente";
          setTimeout(() => {
            this.mensajeExito = "";
          }, 3000);
          
          if (!this.tipoProyecto.id) {
            this.cargarTipo();
          }
        } else {
          this.mensajeError = response?.error || response?.msg || "Error al guardar el tipo de proyecto";
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.error || err.error?.msg || err.statusText}`;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  guardarDireccion(): void {
    // Validar todos los campos de dirección antes de guardar
    this.validarDepartamento();
    this.validarZona();
    this.validarCalle();
    this.validarPuerta();

    // Verificar si hay errores de validación
    if (Object.keys(this.erroresValidacion).length > 0) {
      this.mensajeError = 'Por favor corrige los errores en el formulario de dirección';
      return;
    }

    if (!this.isDireccionFormValid()) {
      this.mensajeError = "Por favor completa todos los campos de la dirección";
      return;
    }

    this.isLoading.set(true);
    this.mensajeError = "";
    this.mensajeExito = "";

    const formData = new FormData();
    formData.append("proy", this.direccion.proy.toString());
    formData.append("pais", this.direccion.pais.trim());
    formData.append("departamento", this.direccion.departamento.trim());
    formData.append("zona", this.direccion.zona.trim());
    formData.append("calle", this.direccion.calle.trim());
    formData.append("puerta", this.direccion.puerta.toString());

    const request = this.tieneDireccion
      ? this.http.put<any>(`${this.apiUrlDirecciones}/${this.direccion.id}`, formData)
      : this.http.post<any>(this.apiUrlDirecciones, formData);

    request.subscribe({
      next: (response: any) => {
        if (response.std === 200 || response.status === 200) {
          this.tieneDireccion = true;
          this.mensajeExito = "Dirección guardada correctamente";
          setTimeout(() => {
            this.mensajeExito = "";
          }, 3000);
          
          if (!this.direccion.id) {
            this.cargarDireccion();
          }
        } else {
          this.mensajeError = response?.error || response?.msg || "Error al guardar la dirección";
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.error || err.error?.msg || err.statusText}`;
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  cambiarSeccion(seccion: "basico" | "tipo" | "direccion" | "reasignar"): void {
    this.seccionActual = seccion;
    this.mensajeError = "";
    this.mensajeExito = "";
    this.erroresValidacion = {};
  }

  goBack(): void {
    this.router.navigate(["/proyectos/"]);
  }
}