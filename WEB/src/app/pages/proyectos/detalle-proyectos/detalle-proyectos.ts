import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { 
  HttpClient, 
  HttpClientModule, 
  HttpErrorResponse 
} from "@angular/common/http";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";

import { ConnectA } from "../../../../config/index";
import { Navbar } from "../../../components/navbar/navbar";
import { Siderbar } from "../../../components/siderbar/siderbar";

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
}

@Component({
  selector: 'app-detalle-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    Navbar,
    Siderbar,
  ],
  templateUrl: './detalle-proyectos.html',
})
export class DetalleProyectos implements OnInit {
  private apiUrlTipos = `${ConnectA.api}/tipo-proyectos`;
  private apiUrlDirecciones = `${ConnectA.api}/direccion-proyectos`;

  proyectoId!: number;
  codigoArquitecto: string = '';
  esNuevoProyecto = false;

  tipoProyecto: TipoProyecto = {
    proy: 0,
    tipo: '',
    subtipo: ''
  };

  direccion: DireccionProyecto = {
    proy: 0,
    pais: 'Bolivia',
    departamento: '',
    zona: '',
    calle: '',
    puerta: 0
  };

  isLoading = signal(false);
  mensajeError = '';
  mensajeExito = '';
  pasoActual: 'tipo' | 'direccion' = 'tipo';

  tipoCompletado = false;
  direccionCompletada = false;

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
  ) {}

  ngOnInit(): void {
    this.tiposDisponibles = Object.keys(this.serviciosCatalogo);
    
    this.route.params.subscribe(params => {
      this.proyectoId = +params['id'];
      if (!this.proyectoId) {
        this.mensajeError = 'ID de proyecto no válido.';
        return;
      }
      this.tipoProyecto.proy = this.proyectoId;
      this.direccion.proy = this.proyectoId;
    });

    this.route.queryParams.subscribe(queryParams => {
      this.esNuevoProyecto = queryParams['nuevo'] === 'true';
      this.codigoArquitecto = queryParams['arq'] || '';
      
      if (!this.esNuevoProyecto) {
        this.cargarDatosExistentes();
      }
    });
  }

  onTipoChange(): void {
    const tipoSeleccionado = this.tipoProyecto.tipo;
    this.subtiposDisponibles = this.serviciosCatalogo[tipoSeleccionado] || [];
    
    if (!this.subtiposDisponibles.includes(this.tipoProyecto.subtipo)) {
      this.tipoProyecto.subtipo = '';
    }
    
    this.limpiarErrores('tipo');
    this.limpiarErrores('subtipo');
  }

  cargarDatosExistentes(): void {    
    this.http.get<ApiResponse<TipoProyecto[]>>(`${this.apiUrlTipos}?proy=${this.proyectoId}`).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          this.tipoProyecto = response.data[0];
          this.tipoCompletado = true;
          if (this.tipoProyecto.tipo) {
            this.onTipoChange();
          }
        }
      },
      error: (err) => console.error('Error al cargar tipo:', err)
    });

    this.http.get<ApiResponse<DireccionProyecto[]>>(`${this.apiUrlDirecciones}?proy=${this.proyectoId}`).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          this.direccion = response.data[0];
          this.direccionCompletada = true;
        }
      },
      error: (err) => console.error('Error al cargar dirección:', err)
    });
  }

  validarTextoSoloLetras(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    
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
    const valor = parseInt(input.value);
    
    if (isNaN(valor) || valor < 1) {
      input.value = '';
      this.direccion.puerta = 0;
    } else if (valor > 9999) {
      this.erroresValidacion['puerta'] = 'El número de puerta no puede ser mayor a 9999';
    return;
    }
  }

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
    
    if (valor > 9999) {
      this.erroresValidacion['puerta'] = 'El número de puerta no puede ser mayor a 9999';
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

  isTipoFormValid(): boolean {
    return this.tipoProyecto.tipo.trim() !== '' && 
           this.tipoProyecto.subtipo.trim() !== '';
  }

  isDireccionFormValid(): boolean {
    return this.direccion.departamento.trim() !== '' &&
           this.direccion.zona.trim() !== '' &&
           this.direccion.calle.trim() !== '' &&
           this.direccion.puerta > 0;
  }

  guardarTipo(): void {
    if (!this.tipoProyecto.tipo.trim() || !this.tipoProyecto.subtipo.trim()) {
      this.mensajeError = 'Por favor completa todos los campos del tipo de proyecto';
      return;
    }

    this.isLoading.set(true);
    this.mensajeError = '';
    this.mensajeExito = '';

    const formData = new FormData();
    formData.append('proy', this.tipoProyecto.proy.toString());
    formData.append('tipo', this.tipoProyecto.tipo);
    formData.append('subtipo', this.tipoProyecto.subtipo);

    this.http.post<ApiResponse<any>>(this.apiUrlTipos, formData).subscribe({
      next: (response: any) => {
        if (response.std === 200 || response.status === 200) {
          this.tipoCompletado = true;
          this.mensajeExito = 'Tipo de proyecto guardado correctamente';
          
          setTimeout(() => {
            this.pasoActual = 'direccion';
            this.mensajeExito = '';
          }, 1000);
        } else {
          this.mensajeError = response?.msg || 'Error al guardar el tipo de proyecto';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.msg || err.statusText}`;
        console.error('Error al guardar tipo:', err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  guardarDireccion(): void {
    this.validarDepartamento();
    this.validarZona();
    this.validarCalle();
    this.validarPuerta();

    if (Object.keys(this.erroresValidacion).length > 0) {
      this.mensajeError = 'Por favor corrige los errores en el formulario de dirección';
      return;
    }
    if (!this.direccion.departamento.trim() || 
        !this.direccion.zona.trim() || 
        !this.direccion.calle.trim() || 
        !this.direccion.puerta) {
      this.mensajeError = 'Por favor completa todos los campos de la dirección';
      return;
    }

    this.isLoading.set(true);
    this.mensajeError = '';
    this.mensajeExito = '';

    const formData = new FormData();
    formData.append('proy', this.direccion.proy.toString());
    formData.append('pais', this.direccion.pais);
    formData.append('departamento', this.direccion.departamento.trim());
    formData.append('zona', this.direccion.zona.trim());
    formData.append('calle', this.direccion.calle.trim());
    formData.append('puerta', this.direccion.puerta.toString());

    this.http.post<ApiResponse<any>>(this.apiUrlDirecciones, formData).subscribe({
      next: (response: any) => {
        if (response.std === 200 || response.status === 200) {
          this.direccionCompletada = true;
          this.mensajeExito = '¡Proyecto completado exitosamente!';
          
          setTimeout(() => {
            this.navegarAProyectos();
          }, 1500);
        } else {
          this.mensajeError = response?.msg || 'Error al guardar la dirección';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.msg || err.statusText}`;
        console.error('Error al guardar dirección:', err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  volverATipo(): void {
    this.pasoActual = 'tipo';
    this.mensajeError = '';
    this.mensajeExito = '';
    this.erroresValidacion = {};
  }

  saltarPaso(): void {
    if (this.pasoActual === 'tipo') {
      this.pasoActual = 'direccion';
    } else if (this.pasoActual === 'direccion') {
      this.navegarAProyectos();
    }
    this.mensajeError = '';
    this.erroresValidacion = {};
  }

  navegarAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }
}