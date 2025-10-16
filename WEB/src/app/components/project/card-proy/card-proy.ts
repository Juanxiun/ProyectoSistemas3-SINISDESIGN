// deno-lint-ignore-file no-sloppy-imports
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { LoadDisplay } from "../../../elements/load-display/load-display";
import { from, Observable, of, BehaviorSubject, combineLatest } from "rxjs";
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
  //comunicacion pa que funcione el buscador
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
        if (!searchTerm.trim()) {
          this.resultsChange.emit(true); 
          return proyectos;
        }
        
        const term = searchTerm.toLowerCase();
        const filtered = proyectos.filter(proyecto =>
          proyecto.nombre?.toLowerCase().includes(term) ||
          proyecto.direccion?.toLowerCase().includes(term)
        );
        
        // informar al navbar si hay resultados o no
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

  // cargar datos
  private cargarProyectos() {
    if (this.usr) {
      from(ListProyectos(this.usr)).subscribe({
        next: (proyectos) => {
          this.proyectos$.next(proyectos);
        },
        error: (error) => {
          console.error('Error cargando proyectos:', error);
          this.proyectos$.next([]);
        }
      });
    } else {
      this.proyectos$.next([]);
    }
  }

  EnviarId(id: number) {
    this.idproy.emit(id);
  }
}