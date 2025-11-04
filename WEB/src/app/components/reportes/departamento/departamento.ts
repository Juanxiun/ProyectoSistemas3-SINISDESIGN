import { Component, Input, OnInit } from '@angular/core';
import { Departamentos, DepartamentoProp, props } from '../../../api/reportes/departamento'; // Ajusta la ruta según tu estructura de archivos
import Chart from 'chart.js/auto'; 

@Component({
  selector: 'app-departamentos-chart',
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Gráfica de Departamentos</h3>
      <div *ngIf="errorMessage" class="text-red-600 font-semibold mb-4">
        {{ errorMessage }}
      </div>
      <canvas id="departamentosChart" *ngIf="data.length > 0" class="w-full h-64"></canvas>
      <p *ngIf="!errorMessage && data.length === 0" class="text-gray-500">Cargando datos...</p>
    </div>
  `,
  styles: [] 
})
export class Departamento implements OnInit {
  @Input() id!: string; 
  @Input() pais!: string; 

  data: DepartamentoProp[] = []; 
  errorMessage: string = ''; 
  chart: any; 

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const params: props = { id: this.id, pais: this.pais };
      this.data = await Departamentos(params);
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
    const ctx = document.getElementById('departamentosChart') as HTMLCanvasElement;
    if (ctx) {

      if (this.chart) {
        this.chart.destroy();
      }

      const labels = this.data.map(item => item.departamento);
      const values = this.data.map(item => item.cantidad);

      this.chart = new Chart(ctx, {
        type: 'bar', 
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad por Departamento',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
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
