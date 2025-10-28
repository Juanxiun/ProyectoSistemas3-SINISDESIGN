import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Departamento } from "../../components/reportes/departamento/departamento";
import { Ganancia } from "../../components/reportes/ganancia/ganancia";
import { Terminado } from "../../components/reportes/terminado/terminado";
import { Tipo } from "../../components/reportes/tipo/tipo";
import { AvancesChartComponent } from "../../components/reportes/avance/avance"; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reportes-dashboard',
  standalone: true, // Hace el componente standalone
  imports: [
    CommonModule,
    ReactiveFormsModule, // Importa ReactiveFormsModule para [formGroup]
    Departamento,
    Ganancia,
    Terminado,
    Tipo,
    AvancesChartComponent
  ],
  template: `
    <div class="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard de Reportes</h1>

      <!-- Formulario superior -->
      <form [formGroup]="reportForm" (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-lg shadow-md mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Campo País (para Departamentos) -->
          <div>
            <label for="pais" class="block text-sm font-medium text-gray-700">País</label>
            <input
              type="text"
              id="pais"
              formControlName="pais"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Colombia"
            />
            <div *ngIf="reportForm.get('pais')?.invalid && reportForm.get('pais')?.touched" class="text-red-600 text-sm mt-1">
              País es requerido.
            </div>
          </div>

          <!-- Campo Fecha Inicio -->
          <div>
            <label for="start" class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              id="start"
              formControlName="start"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div *ngIf="reportForm.get('start')?.invalid && reportForm.get('start')?.touched" class="text-red-600 text-sm mt-1">
              Fecha de inicio es requerida.
            </div>
          </div>

          <!-- Campo Fecha Fin -->
          <div>
            <label for="end" class="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              id="end"
              formControlName="end"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div *ngIf="reportForm.get('end')?.invalid && reportForm.get('end')?.touched" class="text-red-600 text-sm mt-1">
              Fecha de fin es requerida y debe ser posterior a la fecha de inicio.
            </div>
          </div>
        </div>

        <button
          type="submit"
          [disabled]="reportForm.invalid"
          class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Generar Reportes
        </button>
      </form>

      <!-- Componentes de reportes -->
      <div class="space-y-8">
        <app-departamentos-chart [id]="userData?.id" [pais]="reportForm.value.pais"></app-departamentos-chart>
        <app-ganancias-chart [id]="userData?.id" [start]="reportForm.value.start" [end]="reportForm.value.end"></app-ganancias-chart>
        <app-terminados-chart [id]="userData?.id" [start]="reportForm.value.start" [end]="reportForm.value.end"></app-terminados-chart>
        <app-tipos-chart [id]="userData?.id" [start]="reportForm.value.start" [end]="reportForm.value.end"></app-tipos-chart>
        <app-avances-chart [id]="userData?.id" [start]="reportForm.value.start" [end]="reportForm.value.end"></app-avances-chart>
      </div>
    </div>
  `,
  styles: [] // No se necesitan estilos adicionales ya que usamos Tailwind CSS en el template
})
export class ReportesPage implements OnInit {
  userData: any = null;
  reportForm: FormGroup;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario con validaciones
    this.reportForm = this.fb.group({
      pais: ['', Validators.required], // Requerido para Departamentos
      start: ['', Validators.required], // Requerido para los reportes con fechas
      end: ['', Validators.required] // Requerido para los reportes con fechas
    }, {
      validators: this.dateRangeValidator // Validador personalizado para asegurar que end > start
    });
  }

  ngOnInit(): void {
    // Obtener datos del usuario de la cookie
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      console.log(this.userData);
    } else {
      this.router.navigate(["/"]);
    }
  }

  // Validador personalizado para rango de fechas
  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('start')?.value;
    const end = group.get('end')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      // Los componentes se actualizarán automáticamente con los nuevos valores del formulario
      console.log('Formulario válido:', this.reportForm.value);
    }
  }
}
