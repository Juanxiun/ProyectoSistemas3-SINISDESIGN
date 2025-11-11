import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { LoadDisplay } from "../../../elements/load-display/load-display";
import { from, Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ListProps, ListProyectos } from "../../../api/proyectos/list";
import { DeleteProyecto, DeleteProyectoRequest } from "../../../api/proyectos/poryData";
import { AsyncPipe, NgForOf } from "@angular/common";
import { FormsModule } from "@angular/forms"; 
import { EliminacionResponse } from "../../../pages/proyectos/proyectos"; 

@Component({
  selector: "app-card-proy",
  imports: [LoadDisplay, NgForOf, AsyncPipe, FormsModule], 
  templateUrl: "./card-proy.html",
  styles: ``
})
export class CardProy implements OnChanges {
  @Input()
  usr: string = "";
  
  @Input()
  searchTerm: string = ""; 
  
  @Output()
  idproy = new EventEmitter<number>(); 

  @Output()
  resultsChange = new EventEmitter<boolean>(); 

  @Output()
  proyectoEliminado = new EventEmitter<EliminacionResponse>();

  @Output()
  proyectosCargados = new EventEmitter<void>();

  private proyectos$ = new BehaviorSubject<ListProps[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');
  
  proyFiltrados$: Observable<ListProps[]>;

  // Propiedades para el modal de justificación
  mostrarModalJustificacion = false;
  proyectoAEliminar: number | null = null;
  justificacion = '';
  eliminando = false;
  proyectoNombre = '';

  constructor() {
    this.proyFiltrados$ = combineLatest([
      this.proyectos$,
      this.searchTerm$
    ]).pipe(
      map(([proyectos, searchTerm]) => {
        const normalizedSearchTerm = this.normalizeForSearch(searchTerm);
        
        if (!normalizedSearchTerm) {
          this.resultsChange.emit(true); 
          return proyectos;
        }
        
        const filtered = proyectos.filter(proyecto =>
          this.normalizeForSearch(proyecto.nombre).includes(normalizedSearchTerm) ||
          this.normalizeForSearch(proyecto.direccion).includes(normalizedSearchTerm)
        );
        
        this.resultsChange.emit(filtered.length > 0);
        return filtered;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['usr'] && this.usr) {
      this.cargarProyectos();
    }
    
    if (changes['searchTerm']) {
      this.searchTerm$.next(this.searchTerm || '');
    }
  }

  private cargarProyectos() {
    if (this.usr) {
      from(ListProyectos(this.usr)).subscribe({
        next: (proyectos) => {
          this.proyectos$.next(proyectos);
          this.resultsChange.emit(true);
          this.proyectosCargados.emit(); 
        },
        error: (error) => {
          console.error('Error cargando proyectos:', error);
          this.proyectos$.next([]);
          this.resultsChange.emit(false);
        }
      });
    } else {
      this.proyectos$.next([]);
      this.resultsChange.emit(false);
    }
  }

  private normalizeForSearch(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '')
      .trim();
  }

  EnviarId(id: number) {
    this.idproy.emit(id);
  }

  // Método simplificado: siempre mostrar modal de justificación
  eliminarProyecto(event: Event, id: number, proyecto?: ListProps) {
    event.stopPropagation();
    
    this.proyectoAEliminar = id;
    this.proyectoNombre = proyecto?.nombre || 'este proyecto';
    this.mostrarModalJustificacion = true;
    this.justificacion = '';
  }

  // Método para eliminar con justificación
  async eliminarConJustificacion() {
    if (!this.proyectoAEliminar) return;
    
    if (!this.justificacion || this.justificacion.trim().length < 10) {
      alert('La justificación debe tener al menos 10 caracteres.');
      return;
    }

    this.eliminando = true;
    
    try {
      const request: DeleteProyectoRequest = {
        id: this.proyectoAEliminar,
        justificacion: this.justificacion
      };
      
      const resultado = await DeleteProyecto(request);
      
      this.proyectoEliminado.emit({
        success: resultado.success,
        message: resultado.message,
        proyectoId: this.proyectoAEliminar
      });
      
      if (resultado.success) {
        this.cargarProyectos();
        this.cerrarModal();
      }
      
    } catch (error) {
      console.error('Error al eliminar con justificación:', error);
      this.proyectoEliminado.emit({
        success: false,
        message: 'Error al eliminar el proyecto',
        proyectoId: this.proyectoAEliminar
      });
    } finally {
      this.eliminando = false;
    }
  }
  
  cerrarModal() {
    this.mostrarModalJustificacion = false;
    this.proyectoAEliminar = null;
    this.justificacion = '';
    this.eliminando = false;
    this.proyectoNombre = '';
  }

  // Método para cancelar eliminación
  cancelarEliminacion() {
    this.cerrarModal();
    this.proyectoEliminado.emit({
      success: false,
      message: 'Eliminación cancelada por el usuario',
      proyectoId: this.proyectoAEliminar
    });
  }
}