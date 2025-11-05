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

export interface PhasePrediction {
  fastest: number;
  slowest: number;
  average: number;
  predicted: number;
}

export interface PredictionResponse {
  projectPredictedTime: number;
  phasePredictions: {
    [fase: string]: PhasePrediction;
  };
}

export interface FaseCreada {
  nombre: string;
  diasEstimados: number;
  horasEstimadas: number;
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
  private apiUrlPrediccion = `${ConnectA.api}/prediccion`;

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
  pasoActual: 'tipo' | 'direccion' | 'estimado' = 'tipo';

  tipoCompletado = false;
  direccionCompletada = false;
  prediccionCalculada = false;

  botonTipoPresionado = false;
  botonDireccionPresionado = false;

  tiempoTotalEstimado: number = 0;
  fasesCreadas: FaseCreada[] = [];
  fechaFinalEstimada: string = '';
  Math = Math;

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
      }
    });

    this.http.get<ApiResponse<DireccionProyecto[]>>(`${this.apiUrlDirecciones}?proy=${this.proyectoId}`).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          this.direccion = response.data[0];
          this.direccionCompletada = true;
        }
      }
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

    this.botonTipoPresionado = true;
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
          this.pasoActual = 'direccion';
          this.isLoading.set(false);
        } else {
          this.mensajeError = response?.msg || 'Error al guardar el tipo de proyecto';
          this.botonTipoPresionado = false;
          this.isLoading.set(false);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.msg || err.statusText}`;
        this.botonTipoPresionado = false;
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

    this.botonDireccionPresionado = true;
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
          this.calcularPrediccion();
        } else {
          this.mensajeError = response?.msg || 'Error al guardar la dirección';
          this.isLoading.set(false);
          this.botonDireccionPresionado = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = `Error ${err.status}: ${err.error?.msg || err.statusText}`;
        this.isLoading.set(false);
        this.botonDireccionPresionado = false;
      }
    });
  }

  calcularPrediccion(): void {
  this.http.get<PredictionResponse>(`${this.apiUrlPrediccion}/${this.proyectoId}`).subscribe({
    next: (prediction: any) => {
      if (prediction.error) {
        this.mensajeError = 'Dirección guardada pero hubo un problema al calcular la predicción de fases';
        this.isLoading.set(false);
        return;
      }

      this.tiempoTotalEstimado = prediction.projectPredictedTime || 0;
      this.fasesCreadas = [];

      const fechaInicio = new Date();
      const fechaFinal = new Date(fechaInicio);
      fechaFinal.setDate(fechaFinal.getDate() + Math.round(this.tiempoTotalEstimado));
      this.fechaFinalEstimada = fechaFinal.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const ordenFases = [
        'inicial',
        'inspeccion/diseño', 
        'desarrollo',
        'legalizacion',
        'finalizacion'
      ];

      const mapeoNombres: { [key: string]: string } = {
        'inspeccion/disenio': 'inspeccion/diseño',
        'inspeccion-disenio': 'inspeccion/diseño',
        'inspeccion disenio': 'inspeccion/diseño'
      };

      if (prediction.phasePredictions) {
        // Normalizar nombres de fases del backend
        const phasePredictionsNormalizado: any = {};
        for (const [nombreFase, datos] of Object.entries(prediction.phasePredictions)) {
          const nombreNormalizado = mapeoNombres[nombreFase] || nombreFase;
          phasePredictionsNormalizado[nombreNormalizado] = datos;
        }

        for (const nombreFase of ordenFases) {
          const datos = phasePredictionsNormalizado[nombreFase];
          if (datos) {
            const faseData = datos as PhasePrediction;
            this.fasesCreadas.push({
              nombre: nombreFase,
              diasEstimados: Math.round(faseData.predicted),
              horasEstimadas: Math.round(faseData.predicted * 24)
            });
          }
        }

        for (const [nombreFase, datos] of Object.entries(phasePredictionsNormalizado)) {
          if (!ordenFases.includes(nombreFase)) {
            const faseData = datos as PhasePrediction;
            this.fasesCreadas.push({
              nombre: nombreFase,
              diasEstimados: Math.round(faseData.predicted),
              horasEstimadas: Math.round(faseData.predicted * 24)
            });
          }
        }
      }

      this.prediccionCalculada = true;
      this.pasoActual = 'estimado';
      this.isLoading.set(false);
    },
    error: (err: HttpErrorResponse) => {
      this.mensajeError = 'Proyecto guardado pero no se pudo calcular la predicción de fases';
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
      this.pasoActual = 'estimado';
    }
    this.mensajeError = '';
    this.erroresValidacion = {};
  }

  navegarAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }
}