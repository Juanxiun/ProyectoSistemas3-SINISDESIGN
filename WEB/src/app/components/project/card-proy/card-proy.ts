import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { LoadDisplay } from "../../../elements/load-display/load-display";
import { from, Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ListProps, ListProyectos } from "../../../api/proyectos/list";
import { AsyncPipe, NgForOf } from "@angular/common";

@Component({
  selector: "app-card-proy",
  imports: [LoadDisplay, NgForOf, AsyncPipe],
  templateUrl: "./card-proy.html",
  styles: ``,
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

  private proyectos$ = new BehaviorSubject<ListProps[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');
  
  proyFiltrados$: Observable<ListProps[]>;

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
}