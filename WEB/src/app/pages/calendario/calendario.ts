import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class Calendario implements OnInit {
  fechaActual: Date = new Date();
  semanas: Date[][] = [];
  mesActual: string = '';
  anioActual: number = 0;
  hoy: Date = new Date(); 

  ngOnInit(): void {
    this.actualizarCalendario();
  }

  actualizarCalendario(): void {
    const year = this.fechaActual.getFullYear();
    const month = this.fechaActual.getMonth();
    
    this.mesActual = this.fechaActual.toLocaleDateString('es-ES', { month: 'long' });
    this.anioActual = year;
    
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    this.semanas = [];
    let semana: Date[] = [];
    
    // Rellenar días anteriores del mes
    for (let i = primerDia.getDay(); i > 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i);
      semana.push(new Date(fecha));
    }
    
    // Días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(year, month, dia);
      semana.push(fecha);
      
      if (semana.length === 7) {
        this.semanas.push([...semana]);
        semana = [];
      }
    }
    
    // Rellenar días siguientes del mes
    if (semana.length > 0) {
      while (semana.length < 7) {
        const ultimaFecha = semana[semana.length - 1];
        const siguienteDia = new Date(ultimaFecha);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        semana.push(siguienteDia);
      }
      this.semanas.push(semana);
    }
  }

  esMismoDia(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getDate() === fecha2.getDate() &&
           fecha1.getMonth() === fecha2.getMonth() &&
           fecha1.getFullYear() === fecha2.getFullYear();
  }

  esMesActual(fecha: Date): boolean {
    return fecha.getMonth() === this.fechaActual.getMonth();
  }

  mesAnterior(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() - 1);
    this.actualizarCalendario();
  }

  mesSiguiente(): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + 1);
    this.actualizarCalendario();
  }

  irHoy(): void {
    this.fechaActual = new Date();
    this.actualizarCalendario();
  }
}