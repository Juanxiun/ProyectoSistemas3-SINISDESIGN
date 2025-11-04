import { Component, Input, OnInit } from '@angular/core';
import { Ganancias, GananciaProp, props } from '../../../api/reportes/ganancia'; // Ajusta la ruta según tu estructura de archivos
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-ganancias-chart',
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Gráfica de Ganancias</h3>
      <div *ngIf="errorMessage" class="text-red-600 font-semibold mb-4">
        {{ errorMessage }}
      </div>
      <canvas id="gananciasChart" *ngIf="data.length > 0" class="w-full h-64"></canvas>
      <p *ngIf="!errorMessage && data.length === 0" class="text-gray-500">Cargando datos...</p>
    </div>
  `,
  styles: [] 
})
export class Ganancia implements OnInit {
  @Input() id!: string; 
  @Input() start!: string;
  @Input() end!: string;

  data: GananciaProp[] = []; 
  errorMessage: string = '';
  chart: any; 

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const params: props = { id: this.id, start: this.start, end: this.end };
      this.data = await Ganancias(params);
      if (this.data.length > 0) {
        this.createChart();
      } else {
        this.errorMessage = 'No se encontraron datos para los parámetros proporcionados.';
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.errorMessage = 'Error al cargar los datos. Inténtalo de nuevo.';
    }
  }

  createChart(): void {
    const ctx = document.getElementById('gananciasChart') as HTMLCanvasElement;
    if (ctx) {
      // Destruye el gráfico anterior si existe
      if (this.chart) {
        this.chart.destroy();
      }

      // Prepara los datos para Chart.js (gráfica de barras apiladas)
      const labels = this.data.map(item => `Proyecto ${item.proy}`); // Etiquetas basadas en 'proy'
      const totalData = this.data.map(item => item.total);
      const pagoData = this.data.map(item => item.pago);
      const deudaData = this.data.map(item => item.deuda);

      this.chart = new Chart(ctx, {
        type: 'bar', // Tipo de gráfica: barras apiladas
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total',
              data: totalData,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Pago',
              data: pagoData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Deuda',
              data: deudaData,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true // Apila las barras en el eje X
            },
            y: {
              stacked: true, // Apila las barras en el eje Y
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}
