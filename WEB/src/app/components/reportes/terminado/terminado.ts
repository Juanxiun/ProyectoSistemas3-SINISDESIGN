import { Component, Input, OnInit } from '@angular/core';
import { Terminados, TerminadoProp, props } from '../../../api/reportes/terminado';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-terminados-chart',
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Gráfica de Proyectos Terminados</h3>
      <div *ngIf="errorMessage" class="text-red-600 font-semibold mb-4">
        {{ errorMessage }}
      </div>
      <canvas id="terminadosChart" *ngIf="data.length > 0" class="w-full h-64"></canvas>
      <p *ngIf="!errorMessage && data.length === 0" class="text-gray-500">Cargando datos...</p>
    </div>
  `,
  styles: [] // No se necesitan estilos adicionales ya que usamos Tailwind CSS en el template
})
export class Terminado implements OnInit {
  @Input() id!: string;
  @Input() start!: string; 
  @Input() end!: string;

  data: TerminadoProp[] = []; 
  errorMessage: string = ''; 
  chart: any; 

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const params: props = { id: this.id, start: this.start, end: this.end };
      this.data = await Terminados(params);
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
    const ctx = document.getElementById('terminadosChart') as HTMLCanvasElement;
    if (ctx) {

      if (this.chart) {
        this.chart.destroy();
      }

      const labels = this.data.map(item => `Proyecto ${item.proy}`); 
      const terminadoData = this.data.map(item => item.terminado);
      const pendienteData = this.data.map(item => item.pendiente);

      this.chart = new Chart(ctx, {
        type: 'bar', 
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Terminado',
              data: terminadoData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Pendiente',
              data: pendienteData,
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
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}
