import { Component, Input, OnInit } from '@angular/core';
import { Tipos, TipoProp, props } from '../../../api/reportes/tipo'; // Ajusta la ruta según tu estructura de archivos
import Chart from 'chart.js/auto'; // Importa Chart.js

@Component({
  selector: 'app-tipos-chart',
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Gráfica de Tipos de Proyecto</h3>
      <div *ngIf="errorMessage" class="text-red-600 font-semibold mb-4">
        {{ errorMessage }}
      </div>
      <canvas id="tiposChart" *ngIf="data.length > 0" class="w-full h-64"></canvas>
      <p *ngIf="!errorMessage && data.length === 0" class="text-gray-500">Cargando datos...</p>
    </div>
  `,
  styles: [] 
})
export class Tipo implements OnInit {
  @Input() id!: string;
  @Input() start!: string; 
  @Input() end!: string; 

  data: TipoProp[] = []; 
  errorMessage: string = ''; 
  chart: any;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const params: props = { id: this.id, start: this.start, end: this.end };
      this.data = await Tipos(params);
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
    const ctx = document.getElementById('tiposChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.chart) {
        this.chart.destroy();
      }


      const labels = this.data.map(item => `${item.tipo} - ${item.subtipo}`); 
      const values = this.data.map(item => item.cantidad_proyectos);

      this.chart = new Chart(ctx, {
        type: 'bar', 
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Proyectos',
            data: values,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}
