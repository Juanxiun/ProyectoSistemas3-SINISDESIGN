// reportes.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Navbar } from '../../components/navbar/navbar'; 
import { Siderbar } from '../../components/siderbar/siderbar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Ganancias, GananciaProp } from '../../api/reportes/ganancia';
import { Departamentos, DepartamentoProp } from '../../api/reportes/departamento';
import { Terminados, TerminadoProp } from '../../api/reportes/terminado';
import { Avances, AvanceProp } from '../../api/reportes/avance';
import { Tipos, TipoProp } from '../../api/reportes/tipo';
Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Navbar,
    Siderbar
  ],
  templateUrl: './reportes.html'
})
export class Reportes implements OnInit, OnDestroy {
  userData: any = null;
  loading = false;
  error: string | null = null;
  hasData = false;
  generatingPDF = false;

  filterForm: FormGroup;

  // Datos de los reportes
  gananciaData: GananciaProp | null = null;
  departamentosData: DepartamentoProp[] = [];
  terminadosData: TerminadoProp | null = null;
  avanceData: AvanceProp[] = [];
  tiposData: TipoProp[] = [];

  // Métricas calculadas
  tasaCobro: number = 0;
  promedioProyectoPorDepartamento: number = 0;
  tasaCompletitud: number = 0;
  faseConMasProyectos: string = '';
  tipoMasSolicitado: string = '';

  // Charts
  private gananciaChart: Chart | null = null;
  private terminadosChart: Chart | null = null;
  private departamentosChart: Chart | null = null;
  private avanceChart: Chart | null = null;
  private tiposChart: Chart | null = null;

  // Auto-refresh
  private refreshIntervalId: any = null;
  private refreshPeriod = 60000;
  private lastFilters: { arqId?: string; startDate?: string; endDate?: string; pais?: string } = {};
  private isAutoRefreshing = false;
  private formSub: Subscription | null = null;

  // Brand colors
  private readonly brandColors = {
    primary: '#722C23',
    secondary: '#E0A189',
    light: '#F6EFE5',
    dark: '#283845',
    black: '#181A18',
    accent: '#C97D60',
    textLight: 'rgba(40, 56, 69, 0.8)' // Cambiado para mejor legibilidad en fondo claro
  };

  // Chart instances for PDF
  private chartImages: { [key: string]: string } = {};

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    this.filterForm = this.fb.group({
      startDate: [this.formatDate(startDate), Validators.required],
      endDate: [this.formatDate(endDate), Validators.required],
      pais: ['Bolivia', Validators.required]
    });
  }

  private async fetchReports(arqId: string, startDate: string, endDate: string, pais: string) {
    const promises = [
      Ganancias({ id: arqId, start: startDate, end: endDate }),
      Departamentos({ id: arqId, pais }),
      Terminados({ id: arqId, start: startDate, end: endDate }),
      Avances({ id: arqId, start: startDate, end: endDate }),
      Tipos({ id: arqId, start: startDate, end: endDate })
    ];
    return await Promise.all(promises) as [any, any, any, any, any];
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    if (!this.lastFilters.arqId) return;
    this.refreshIntervalId = setInterval(() => {
      this.refreshReports();
    }, this.refreshPeriod);
  }

  private stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  private async refreshReports(): Promise<void> {
    if (!this.lastFilters.arqId || this.isAutoRefreshing) return;
    this.isAutoRefreshing = true;
    try {
      const { arqId, startDate, endDate, pais } = this.lastFilters as any;
      const [ganancias, departamentos, terminados, avances, tipos] = await this.fetchReports(arqId, startDate, endDate, pais);

      this.gananciaData = ganancias[0] || null;
      this.departamentosData = departamentos;
      this.terminadosData = terminados[0] || null;
      this.avanceData = avances;
      this.tiposData = tipos;

      this.calcularMetricas();

      const hasAnyData = this.gananciaData || this.departamentosData.length > 0 || this.terminadosData || this.avanceData.length > 0 || this.tiposData.length > 0;
      if (hasAnyData) {
        this.hasData = true;
        setTimeout(() => this.crearGraficos(), 100);
      }
    } catch (e) {
      console.error('Error auto-refreshing reports:', e);
    } finally {
      this.isAutoRefreshing = false;
    }
  }

  ngOnInit(): void {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
    } else {
      this.router.navigate(["/"]);
    }

    if (this.userData) {
      setTimeout(() => this.generarReportes(), 300);
    }

    this.formSub = this.filterForm.valueChanges.pipe(debounceTime(800)).subscribe(() => {
      if (this.hasData) {
        this.generarReportes();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    this.stopAutoRefresh();
    if (this.formSub) {
      this.formSub.unsubscribe();
      this.formSub = null;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async generarReportes(): Promise<void> {
    if (!this.filterForm.valid || !this.userData) {
      this.error = 'Por favor, complete todos los campos';
      return;
    }

    this.loading = true;
    this.error = null;
    this.hasData = false;
    this.destroyCharts();

    try {
      const { startDate, endDate, pais } = this.filterForm.value;
      const arqId = this.userData.id;

      if (new Date(startDate) > new Date(endDate)) {
        this.error = 'La fecha de inicio no puede ser mayor a la fecha fin';
        this.loading = false;
        return;
      }

      const [ganancias, departamentos, terminados, avances, tipos] = await this.fetchReports(arqId, startDate, endDate, pais);

      this.gananciaData = ganancias[0] || null;
      this.departamentosData = departamentos;
      this.terminadosData = terminados[0] || null;
      this.avanceData = avances;
      this.tiposData = tipos;

      this.calcularMetricas();

      const hasAnyData = this.gananciaData || this.departamentosData.length > 0 || this.terminadosData || this.avanceData.length > 0 || this.tiposData.length > 0;
      
      if (hasAnyData) {
        this.hasData = true;
        this.lastFilters = { arqId, startDate, endDate, pais };
        this.startAutoRefresh();
        
        setTimeout(() => {
          this.crearGraficos();
        }, 100);
      } else {
        this.error = 'No se encontraron datos para el período seleccionado';
      }

    } catch (err) {
      console.error('Error al generar reportes:', err);
      this.error = 'Error al cargar los datos. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  private calcularMetricas(): void {
    if (this.gananciaData && this.gananciaData.total > 0) {
      this.tasaCobro = Math.round((this.gananciaData.pago / this.gananciaData.total) * 100);
    } else {
      this.tasaCobro = 0;
    }

    if (this.departamentosData.length > 0) {
      const totalProyectos = this.departamentosData.reduce((sum, d) => sum + d.cantidad, 0);
      this.promedioProyectoPorDepartamento = Math.round(totalProyectos / this.departamentosData.length);
    } else {
      this.promedioProyectoPorDepartamento = 0;
    }

    if (this.terminadosData && this.terminadosData.proy > 0) {
      this.tasaCompletitud = Math.round((this.terminadosData.terminado / this.terminadosData.proy) * 100);
    } else {
      this.tasaCompletitud = 0;
    }

    if (this.avanceData.length > 0) {
      const faseMax = this.avanceData.reduce((prev, current) => 
        (prev.terminado > current.terminado) ? prev : current
      );
      this.faseConMasProyectos = faseMax.fase;
    } else {
      this.faseConMasProyectos = 'N/A';
    }

    if (this.tiposData.length > 0) {
      const tipoMax = this.tiposData.reduce((prev, current) => 
        (prev.cantidad_proyectos > current.cantidad_proyectos) ? prev : current
      );
      this.tipoMasSolicitado = tipoMax.tipo;
    } else {
      this.tipoMasSolicitado = 'N/A';
    }
  }

 // reportes.page.ts - Método crearGraficos() mejorado
private crearGraficos(): void {
  this.destroyCharts();

  const setCanvasSize = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const parent = canvas.parentElement as HTMLElement | null;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  // Configuración global de fuentes y colores
  const chartDefaults = {
    font: {
      family: "'Inter', 'Segoe UI', Roboto, sans-serif",
      size: 12
    },
    colors: {
      grid: 'rgba(40, 56, 69, 0.08)',
      text: '#374151',
      textLight: '#6B7280',
      white: '#ffffff'
    }
  };

  // Gráfico de Ganancias con gradientes modernos
  if (this.gananciaData) {
    const ctxGanancia = document.getElementById('gananciaChart') as HTMLCanvasElement;
    if (ctxGanancia) {
      setCanvasSize(ctxGanancia);
      const ctx = ctxGanancia.getContext('2d');
      
      if (ctx) {
        // Gradientes elegantes
        const gradientTotal = ctx.createLinearGradient(0, 0, 0, 350);
        gradientTotal.addColorStop(0, 'rgba(224, 161, 137, 1)');
        gradientTotal.addColorStop(1, 'rgba(224, 161, 137, 0.7)');

        const gradientCobrado = ctx.createLinearGradient(0, 0, 0, 350);
        gradientCobrado.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
        gradientCobrado.addColorStop(1, 'rgba(5, 150, 105, 0.75)');

        const gradientDeuda = ctx.createLinearGradient(0, 0, 0, 350);
        gradientDeuda.addColorStop(0, 'rgba(114, 44, 35, 0.95)');
        gradientDeuda.addColorStop(1, 'rgba(114, 44, 35, 0.75)');

        this.gananciaChart = new Chart(ctxGanancia, {
          type: 'bar',
          data: {
            labels: ['Total Facturado', 'Total Cobrado', 'Deuda Pendiente'],
            datasets: [{
              label: 'Monto ($)',
              data: [
                this.gananciaData.total || 0,
                this.gananciaData.pago || 0,
                this.gananciaData.deuda || 0
              ],
              backgroundColor: [gradientTotal, gradientCobrado, gradientDeuda],
              borderRadius: 12,
              borderWidth: 0,
              barThickness: 60
            }]
          },
          options: {
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.96)',
                padding: 16,
                titleFont: { 
                  size: 15, 
                  weight: 'bold', 
                  family: chartDefaults.font.family 
                },
                bodyFont: { 
                  size: 14, 
                  family: chartDefaults.font.family 
                },
                borderColor: 'rgba(224, 161, 137, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                  label: (context) => `$${context.parsed.y?.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                border: { display: false },
                grid: {
                  color: chartDefaults.colors.grid,
                  lineWidth: 1
                },
                ticks: {
                  font: { 
                    size: 12, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.textLight,
                  padding: 8,
                  callback: (value) => `$${Number(value).toLocaleString('es-ES')}`
                }
              },
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  font: { 
                    size: 12, 
                    weight: 600, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.text,
                  padding: 8
                }
              }
            }
          }
        });
      }
    }
  }

  // Gráfico de Terminados (Dona moderna)
  if (this.terminadosData) {
    const ctxTerminados = document.getElementById('terminadosChart') as HTMLCanvasElement;
    if (ctxTerminados) {
      setCanvasSize(ctxTerminados);
      const terminado = this.terminadosData.terminado || 0;
      const pendiente = this.terminadosData.pendiente || 0;

      this.terminadosChart = new Chart(ctxTerminados, {
        type: 'doughnut',
        data: {
          labels: ['Terminados', 'Pendientes'],
          datasets: [{
            data: [terminado, pendiente],
            backgroundColor: [
              'rgba(16, 185, 129, 0.9)',
              'rgba(201, 125, 96, 0.9)'
            ],
            borderColor: chartDefaults.colors.white,
            borderWidth: 4,
            hoverOffset: 20,
            hoverBorderColor: chartDefaults.colors.white,
            hoverBorderWidth: 5
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: { 
                  size: 13, 
                  weight: 600, 
                  family: chartDefaults.font.family 
                },
                color: chartDefaults.colors.text,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.96)',
              padding: 16,
              titleFont: { 
                size: 14, 
                weight: 'bold', 
                family: chartDefaults.font.family 
              },
              bodyFont: { 
                size: 13, 
                family: chartDefaults.font.family 
              },
              borderColor: 'rgba(224, 161, 137, 0.3)',
              borderWidth: 1,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const total = terminado + pendiente;
                  const percentage = Math.round((context.raw as number / total) * 100);
                  return `${context.label}: ${context.raw} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '70%',
          animation: {
            animateRotate: true,
            animateScale: true
          }
        }
      });
    }
  }

  // Gráfico de Departamentos (Barras horizontales)
  if (this.departamentosData.length > 0) {
    const ctxDepartamentos = document.getElementById('departamentosChart') as HTMLCanvasElement;
    if (ctxDepartamentos) {
      setCanvasSize(ctxDepartamentos);
      const ctx = ctxDepartamentos.getContext('2d');

      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 400, 0);
        gradient.addColorStop(0, 'rgba(201, 125, 96, 0.95)');
        gradient.addColorStop(1, 'rgba(201, 125, 96, 0.65)');

        this.departamentosChart = new Chart(ctxDepartamentos, {
          type: 'bar',
          data: {
            labels: this.departamentosData.map(d => d.departamento),
            datasets: [{
              label: 'Cantidad de Proyectos',
              data: this.departamentosData.map(d => d.cantidad),
              backgroundColor: gradient,
              borderRadius: 10,
              borderWidth: 0,
              barThickness: 28
            }]
          },
          options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.96)',
                padding: 16,
                titleFont: { 
                  size: 14, 
                  weight: 'bold', 
                  family: chartDefaults.font.family 
                },
                bodyFont: { 
                  size: 13, 
                  family: chartDefaults.font.family 
                },
                borderColor: 'rgba(224, 161, 137, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.parsed.x} proyectos`
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                border: { display: false },
                grid: {
                  color: chartDefaults.colors.grid,
                  lineWidth: 1
                },
                ticks: {
                  font: { 
                    size: 11, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.textLight,
                  padding: 6,
                  stepSize: 1
                }
              },
              y: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  font: { 
                    size: 12, 
                    weight: 600, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.text,
                  padding: 8
                }
              }
            }
          }
        });
      }
    }
  }

  // Gráfico de Avances por Fase
  if (this.avanceData.length > 0) {
    const ctxAvance = document.getElementById('avanceChart') as HTMLCanvasElement;
    if (ctxAvance) {
      setCanvasSize(ctxAvance);
      const ctx = ctxAvance.getContext('2d');

      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, 'rgba(224, 161, 137, 0.95)');
        gradient.addColorStop(1, 'rgba(224, 161, 137, 0.65)');

        this.avanceChart = new Chart(ctxAvance, {
          type: 'bar',
          data: {
            labels: this.avanceData.map(a => a.fase),
            datasets: [{
              label: 'Proyectos Completados',
              data: this.avanceData.map(a => a.terminado),
              backgroundColor: gradient,
              borderRadius: 12,
              borderWidth: 0,
              barThickness: 50
            }]
          },
          options: {
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.96)',
                padding: 16,
                titleFont: { 
                  size: 14, 
                  weight: 'bold', 
                  family: chartDefaults.font.family 
                },
                bodyFont: { 
                  size: 13, 
                  family: chartDefaults.font.family 
                },
                borderColor: 'rgba(224, 161, 137, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.parsed.y} proyectos completados`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                border: { display: false },
                grid: {
                  color: chartDefaults.colors.grid,
                  lineWidth: 1
                },
                ticks: {
                  font: { 
                    size: 12, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.textLight,
                  padding: 8,
                  stepSize: 1
                }
              },
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  font: { 
                    size: 12, 
                    weight: 600, 
                    family: chartDefaults.font.family 
                  },
                  color: chartDefaults.colors.text,
                  padding: 8,
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            }
          }
        });
      }
    }
  }

  // Gráfico de Tipos de Proyectos (Pie chart moderno)
  if (this.tiposData.length > 0) {
    const ctxTipos = document.getElementById('tiposChart') as HTMLCanvasElement;
    if (ctxTipos) {
      setCanvasSize(ctxTipos);
      const tiposAgrupados = this.tiposData.reduce((acc, item) => {
        if (!acc[item.tipo]) {
          acc[item.tipo] = 0;
        }
        acc[item.tipo] += item.cantidad_proyectos;
        return acc;
      }, {} as Record<string, number>);

      const labels = Object.keys(tiposAgrupados);
      const data = Object.values(tiposAgrupados);

      // Paleta de colores moderna y vibrante
      const modernColors = [
        'rgba(114, 44, 35, 0.9)',     // Primary
        'rgba(201, 125, 96, 0.9)',    // Accent
        'rgba(224, 161, 137, 0.9)',   // Secondary
        'rgba(16, 185, 129, 0.9)',    // Green
        'rgba(59, 130, 246, 0.9)',    // Blue
        'rgba(139, 92, 246, 0.9)',    // Purple
        'rgba(236, 72, 153, 0.9)',    // Pink
        'rgba(245, 158, 11, 0.9)',    // Yellow
        'rgba(20, 184, 166, 0.9)',    // Teal
        'rgba(249, 115, 22, 0.9)'     // Orange
      ];

      this.tiposChart = new Chart(ctxTipos, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, index) => modernColors[index % modernColors.length]),
            borderColor: chartDefaults.colors.white,
            borderWidth: 3,
            hoverOffset: 20,
            hoverBorderColor: chartDefaults.colors.white,
            hoverBorderWidth: 4
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 15,
                font: { 
                  size: 12, 
                  weight: 600, 
                  family: chartDefaults.font.family 
                },
                color: chartDefaults.colors.text,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 10,
                boxHeight: 10
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.96)',
              padding: 16,
              titleFont: { 
                size: 14, 
                weight: 'bold', 
                family: chartDefaults.font.family 
              },
              bodyFont: { 
                size: 13, 
                family: chartDefaults.font.family 
              },
              borderColor: 'rgba(224, 161, 137, 0.3)',
              borderWidth: 1,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const total = data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((context.raw as number / total) * 100);
                  return `${context.label}: ${context.raw} proyectos (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true
          }
        }
      });
    }
  }
  this.preparaChartImages();
}

async exportarPDF(): Promise<void> {
  if (!this.hasData) {
    this.error = 'Primero genere los reportes antes de exportar a PDF';
    return;
  }

  this.generatingPDF = true;
  this.error = null;

  try {
    // Esperar a que los gráficos se capturen correctamente
    await this.preparaChartImages();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    const { startDate, endDate, pais } = this.filterForm.value;
    const currentDate = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    let currentPageNumber = 1;

    // ========== ESTILOS Y COLORES ==========
    const colors = {
      primary: [114, 44, 35],    // Rojo vino - principal
      secondary: [201, 125, 96], // Salmón
      accent: [224, 161, 137],   // Salmón claro
      dark: [40, 56, 69],        // Azul oscuro
      success: [16, 185, 129],   // Verde éxito
      warning: [245, 158, 11],   // Ámbar
      danger: [239, 68, 68],     // Rojo
      light: [246, 239, 229],    // Beige claro
      white: [255, 255, 255]
    };

    // Función para degradados sutiles
    const drawGradientHeader = (y: number, height: number) => {
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.rect(0, y, pageWidth, height, 'F');
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(0, y + height - 2, pageWidth, 2, 'F');
    };

    const drawHeader = () => {
      // Header con degradado
      drawGradientHeader(0, 20);
      
      // Logo (si existe) - usando círculo como placeholder elegante
      pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.circle(margin + 8, 10, 4, 'F');
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(0.5);
      pdf.circle(margin + 8, 10, 4, 'S');
      
      // Nombre de la empresa con tipografía elegante
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SINISDESIGN', margin + 20, 12);
      
      // Número de página elegante
      pdf.setFontSize(9);
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Pagina ${currentPageNumber}`, pageWidth - margin - 15, 12);
    };

    const drawFooter = () => {
      // Línea decorativa fina
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Texto del footer
      pdf.setFontSize(7);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFont('helvetica', 'normal');
      
      // Elemento decorativo izquierdo
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(margin, pageHeight - 8, 3, 1, 'F');
      pdf.text('SINISDESIGN - Gestion de Proyectos', margin + 6, pageHeight - 5);
      
      // Elemento decorativo derecho
      pdf.rect(pageWidth - margin - 3, pageHeight - 8, 3, 1, 'F');
      pdf.text(currentDate, pageWidth - margin - 40, pageHeight - 5);
    };

    const addNewPage = () => {
      drawFooter();
      pdf.addPage();
      currentPageNumber++;
      drawHeader();
      return 28;
    };

    const drawSectionTitle = (title: string, y: number): number => {
      // Título con subrayado decorativo
      pdf.setFontSize(14);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, y);
      
      // Línea decorativa bajo el título
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(1);
      const titleWidth = pdf.getTextWidth(title);
      pdf.line(margin, y + 2, margin + titleWidth + 5, y + 2);
      
      // Punto decorativo al final de la línea
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.circle(margin + titleWidth + 8, y + 2, 1, 'F');
      
      return y + 8;
    };

    const drawMetricCard = (x: number, y: number, width: number, height: number, 
                           label: string, value: string, color: number[]) => {
      // Sombra sutil
      pdf.setFillColor(220, 220, 220);
      pdf.roundedRect(x + 1, y + 1, width, height, 4, 4, 'F');
      
      // Tarjeta principal
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(x, y, width, height, 4, 4, 'F');
      
      // Línea decorativa superior
      pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.rect(x, y, width, 2, 'F');
      
      // Label
      pdf.setFontSize(8);
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label.toUpperCase(), x + 8, y + 10);
      
      // Value
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const vWidth = pdf.getTextWidth(value);
      pdf.text(value, x + width - vWidth - 8, y + 22);
      
      // Punto decorativo al inicio
      pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.circle(x + 5, y + 7, 1.5, 'F');
    };

    // ========== PORTADA ELEGANTE ==========
    drawHeader();
    let yPos = 40;

    // Título principal con estilo
    pdf.setFontSize(26);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFont('helvetica', 'bold');
    const title = 'REPORTE EJECUTIVO';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yPos);

    // Subtítulo estilizado
    yPos += 8;
    pdf.setFontSize(14);
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.setFont('helvetica', 'italic');
    const subtitle = 'Analisis de Proyectos Arquitectonicos';
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, yPos);

    // Línea decorativa central
    yPos += 6;
    pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setLineWidth(1.5);
    pdf.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);

    // Tarjeta de información con diseño moderno
    yPos += 10;
    pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    pdf.roundedRect(margin + 5, yPos, contentWidth - 10, 35, 6, 6, 'F');
    pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin + 5, yPos, contentWidth - 10, 35, 6, 6, 'S');

    // Icono decorativo
    pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.rect(margin + 10, yPos - 3, 20, 3, 'F');

    pdf.setFontSize(11);
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACION DEL PERIODO', margin + 15, yPos + 8);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    // Información en columnas
    const col1 = margin + 15;
    const col2 = margin + contentWidth / 2;
    
    pdf.text(`Periodo:`, col1, yPos + 16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${startDate} - ${endDate}`, col1 + 20, yPos + 16);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Pais:`, col2, yPos + 16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(pais, col2 + 15, yPos + 16);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado:`, col1, yPos + 24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(currentDate, col1 + 20, yPos + 24);

    // Métricas principales con diseño de cuadrícula
    yPos += 50;
    yPos = drawSectionTitle('METRICAS CLAVE', yPos);
    yPos +=6;
    const metrics = [
      { label: 'Tasa de Cobro', value: `${this.tasaCobro}%`, color: colors.primary },
      { label: 'Completitud', value: `${this.tasaCompletitud}%`, color: colors.success},
      { label: 'Total Proyectos', value: this.gananciaData?.proy.toString() || '0', color: colors.secondary  },
      { label: 'Prom/Depto', value: this.promedioProyectoPorDepartamento.toString(), color: colors.dark }
    ];

    const metricWidth = (contentWidth - 16) / 2;
    const metricHeight = 29;
    
    metrics.forEach((metric, idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const x = margin + col * (metricWidth + 10);
      const y = yPos + row * (metricHeight + 8);

      drawMetricCard(x, y, metricWidth, metricHeight, metric.label, metric.value, metric.color);
    
    });

    drawFooter();

    // ========== PÁGINA 2: ANÁLISIS FINANCIERO ELEGANTE ==========
    yPos = addNewPage();
    yPos = drawSectionTitle('ANALISIS FINANCIERO', yPos);
    yPos += 4;

    if (this.gananciaData) {
      const finItems = [
        { 
          label: 'Total Facturado', 
          value: `$${this.gananciaData.total.toLocaleString('es-ES', {maximumFractionDigits: 0})}`, 
          color: colors.secondary,
        },
        { 
          label: 'Total Cobrado', 
          value: `$${this.gananciaData.pago.toLocaleString('es-ES', {maximumFractionDigits: 0})}`, 
          color: colors.success,
        },
        { 
          label: 'Deuda Pendiente', 
          value: `$${(this.gananciaData?.deuda ?? 0).toLocaleString('es-ES', {maximumFractionDigits: 0})}`, 
          color: colors.danger,
        }
      ];

      const finWidth = (contentWidth - 8) / 3;
      finItems.forEach((item, idx) => {
        const x = margin + idx * (finWidth + 4);
        
        // Tarjeta financiera con diseño mejorado
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(x, yPos, finWidth, 24, 4, 4, 'F');
        
        // Borde de color
        pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
        pdf.setLineWidth(1.5);
        pdf.roundedRect(x, yPos, finWidth, 24, 4, 4, 'S');

        // Icono
        pdf.setFontSize(12);
        pdf.setTextColor(item.color[0], item.color[1], item.color[2]);

        // Label
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label.toUpperCase(), x + 20, yPos + 8);

        // Value
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(item.value, finWidth - 10);
        const valueY = lines.length > 1 ? yPos + 18 : yPos + 17;
        pdf.text(lines, x + finWidth / 2, valueY, { align: 'center' });
      });

      yPos += 30;
    }

    // Gráfico de ganancias con marco elegante
    if (this.chartImages['gananciaChart']) {
      // Título del gráfico
      pdf.setFontSize(10);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVOLUCION FINANCIERA', margin, yPos);
      yPos += 4;

      // Marco para el gráfico
      const chartHeight = 75;
      const chartWidth = contentWidth;
      
      // Fondo del gráfico con sombra
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'F');
      
      // Borde del gráfico
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'S');

      // Insertar gráfico
      pdf.addImage(this.chartImages['gananciaChart'], 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 10;
    }

    // ========== ESTADO DE PROYECTOS ==========
    yPos = drawSectionTitle('ESTADO DE PROYECTOS', yPos);
    yPos += 5;

    if (this.terminadosData) {
      const statusItems = [
        { 
          label: 'Proyectos Terminados', 
          value: this.terminadosData.terminado.toString(), 
          color: colors.success,
        },
        { 
          label: 'Proyectos Pendientes', 
          value: this.terminadosData.pendiente.toString(), 
          color: colors.warning,
        }
      ];

      const statusWidth = (contentWidth - 10) / 2;
      
      statusItems.forEach((item, idx) => {
        const x = margin + idx * (statusWidth + 6);
        
        // Tarjeta de estado con diseño moderno
        pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
        pdf.roundedRect(x, yPos, statusWidth, 22, 4, 4, 'F');
        // Label
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label.toUpperCase(), x + 20, yPos + 8);

        // Value
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const vWidth = pdf.getTextWidth(item.value);
        pdf.text(item.value, x + statusWidth - vWidth - 8, yPos + 17);
      });

      yPos += 28;
    }

    // Gráfico de terminados
    if (this.chartImages['terminadosChart']) {
      pdf.setFontSize(10);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DISTRIBUCION DE ESTADOS', margin, yPos);
      yPos += 4;

      const chartHeight = 70;
      const chartWidth = contentWidth;
      
      // Marco con sombra sutil
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'F');
      
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'S');

      pdf.addImage(this.chartImages['terminadosChart'], 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 8;
    }

    drawFooter();

    // ========== PÁGINA 3: DISTRIBUCIONES ==========
    yPos = addNewPage();
    
    // Gráfico de departamentos
    yPos = drawSectionTitle('DISTRIBUCION POR DEPARTAMENTO', yPos);
    yPos += 4;

    if (this.chartImages['departamentosChart']) {
      const chartHeight = 85;
      const chartWidth = contentWidth;
      
      // Fondo con patrón sutil
      pdf.setFillColor(248, 248, 248);
      pdf.roundedRect(margin - 3, yPos - 3, chartWidth + 6, chartHeight + 6, 4, 4, 'F');
      
      // Borde decorativo
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin - 3, yPos - 3, chartWidth + 6, chartHeight + 6, 4, 4, 'S');

      pdf.addImage(this.chartImages['departamentosChart'], 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 12;
    }

    // Gráfico de fases
    yPos = drawSectionTitle('PROGRESO POR FASE', yPos);
    yPos += 4;

    if (this.chartImages['avanceChart']) {
      const chartHeight = 80;
      const chartWidth = contentWidth;
      
      // Fondo con gradiente sutil
      pdf.setFillColor(252, 252, 252);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'F');
      
      // Borde
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4, 3, 3, 'S');

      if (yPos + chartHeight > pageHeight - 25) {
        yPos = addNewPage();
        yPos = drawSectionTitle('PROGRESO POR FASE', yPos);
        yPos += 4;
      }
      
      pdf.addImage(this.chartImages['avanceChart'], 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 8;
    }

    drawFooter();

    // ========== PÁGINA 4: TIPOS Y RESUMEN ==========
    yPos = addNewPage();
    
    // Gráfico de tipos
    yPos = drawSectionTitle('DISTRIBUCION POR TIPO DE PROYECTO', yPos);
    yPos += 4;

    if (this.chartImages['tiposChart']) {
      const chartHeight = 85;
      const chartWidth = contentWidth;
      
      // Marco elegante
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(margin - 3, yPos - 3, chartWidth + 6, chartHeight + 6, 4, 4, 'F');
      
      pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin - 3, yPos - 3, chartWidth + 6, chartHeight + 6, 4, 4, 'S');

      pdf.addImage(this.chartImages['tiposChart'], 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 15;
    }

    // ========== RESUMEN EJECUTIVO ELEGANTE ==========
    yPos = drawSectionTitle('RESUMEN EJECUTIVO', yPos);
    yPos += 8;

    // Tarjeta de resumen con diseño premium
    pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    pdf.roundedRect(margin, yPos, contentWidth, 85, 6, 6, 'F');
    
    // Borde con detalle
    pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, yPos, contentWidth, 85, 6, 6, 'S');
    
    // Encabezado de la tarjeta
    pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.roundedRect(margin, yPos, contentWidth, 10, 6, 6, 'F');
    
    pdf.setFontSize(11);
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONCLUSIONES PRINCIPALES', margin + 10, yPos + 6.5);

    // Contenido del resumen
    const summaryY = yPos + 18;
    
    const summaryPoints = [
      { text: `Período analizado: ${startDate} al ${endDate} en ${pais}` },
      { text: `Total de proyectos gestionados: ${this.gananciaData?.proy || 0}` },
      {text: `Eficiencia de cobro alcanzada: ${this.tasaCobro}%` },
      { text: `Nivel de completitud general: ${this.tasaCompletitud}%` },
      { text: `Fase con mayor actividad: ${this.faseConMasProyectos}` },
      { text: `Tipo de proyecto predominante: ${this.tipoMasSolicitado}` },
      { text: `Promedio por departamento: ${this.promedioProyectoPorDepartamento} proyectos` }
    ];

    summaryPoints.forEach((point, idx) => {
      const pointY = summaryY + idx * 9;
      
      // Icono
      pdf.setFontSize(9);
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      
      // Texto
      pdf.setFontSize(9);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text(point.text, margin + 18, pointY);
    });
    drawFooter();

    // ========== GUARDAR PDF ==========
    const filename = `Reporte_SINISDESIGN_${startDate.replace(/\//g, '-')}_${endDate.replace(/\//g, '-')}.pdf`;
    pdf.save(filename);

  } catch (err) {
    console.error('Error al generar PDF:', err);
    this.error = 'Error al generar el PDF. Por favor, intenta nuevamente.';
  } finally {
    this.generatingPDF = false;
  }
}

private async preparaChartImages(): Promise<void> {
  this.chartImages = {};
  
  const chartConfigs = [
    { 
      id: 'gananciaChart', 
      width: 1600, 
      height: 600,
      backgroundColor: '#FFFFFF'
    },
    { 
      id: 'terminadosChart', 
      width: 1600, 
      height: 550,
      backgroundColor: '#FFFFFF'
    },
    { 
      id: 'departamentosChart', 
      width: 1600, 
      height: 700,
      backgroundColor: '#FFFFFF'
    },
    { 
      id: 'avanceChart', 
      width: 1600, 
      height: 600,
      backgroundColor: '#FFFFFF'
    },
    { 
      id: 'tiposChart', 
      width: 1600, 
      height: 700,
      backgroundColor: '#FFFFFF'
    }
  ];
  
  for (const config of chartConfigs) {
    try {
      const canvas = document.getElementById(config.id) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`Canvas ${config.id} no encontrado`);
        continue;
      }

      // Crear canvas temporal
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        console.warn(`No se pudo obtener contexto para ${config.id}`);
        continue;
      }

      // Configurar tamaño
      tempCanvas.width = config.width;
      tempCanvas.height = config.height;
      
      // Fondo blanco
      tempCtx.fillStyle = config.backgroundColor;
      tempCtx.fillRect(0, 0, config.width, config.height);
      
      // Escalar manteniendo proporciones
      const scaleW = config.width / canvas.width;
      const scaleH = config.height / canvas.height;
      const scale = Math.min(scaleW, scaleH) * 0.85; // 85% para dejar margen
      
      const x = (config.width - canvas.width * scale) / 2;
      const y = (config.height - canvas.height * scale) / 2;
      
      // Aplicar suavizado de alta calidad
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      
      // Dibujar el gráfico
      tempCtx.save();
      tempCtx.translate(x, y);
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(canvas, 0, 0);
      tempCtx.restore();
      
      // Guardar la imagen
      this.chartImages[config.id] = tempCanvas.toDataURL('image/png', 1.0);
      
      console.log(`✓ Gráfico ${config.id} capturado exitosamente`);
      
    } catch (err) {
      console.error(`Error capturando gráfico ${config.id}:`, err);
    }
  }
  
  // Pequeña pausa para asegurar que todas las imágenes se procesen
  await new Promise(resolve => setTimeout(resolve, 100));
}

private destroyCharts(): void {
  const charts = [
    this.gananciaChart,
    this.terminadosChart,
    this.departamentosChart,
    this.avanceChart,
    this.tiposChart
  ];

  charts.forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });

  this.gananciaChart = null;
  this.terminadosChart = null;
  this.departamentosChart = null;
  this.avanceChart = null;
  this.tiposChart = null;
}
}