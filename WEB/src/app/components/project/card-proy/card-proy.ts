import { Component, Optional, Host, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { LoadDisplay } from "../../../elements/load-display/load-display";
import { from, Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ListProps, ListProyectos } from "../../../api/proyectos/list";
import { DeleteProyecto } from "../../../api/proyectos/poryData";
import { AsyncPipe, NgForOf } from "@angular/common";
import { CookieService } from "ngx-cookie-service";
import { Proyectos } from "../../../pages/proyectos/proyectos";
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

  @Output()
  proyectoEliminado = new EventEmitter<number>(); // Emite el ID del proyecto eliminado

  @Output()
  proyectosCargados = new EventEmitter<void>(); // Emite cuando se cargan proyectos

  @Output() onNotificar = new EventEmitter<{ tipo: 1 | 2 | 3, mensaje: string }>();

  proyectos$ = new BehaviorSubject<ListProps[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');
  cantProyectos: number = 0;
  proyFiltrados$: Observable<ListProps[]>;
  userData: any = null;

  constructor(private cookieService: CookieService) {
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

  async eliminarProyecto(event: Event, id: number) {
    event.stopPropagation();
    const cookieValue = this.cookieService.get("sesion");
    this.userData = JSON.parse(cookieValue);
    console.log(this.userData);

    if (this.userData.admin == 0) {
      alert('SI QUIERES ELIMINAR TU PROYECTO, CONSULTA CON UN ADMINISTRADOR PARA DESACTIVAR TU PROYECTO');
      this.onNotificar.emit({ tipo: 2, mensaje: 'CONSULTA CON UN ADMINISTRADOR PARA DESACTIVAR TU PROYECTO' });
      return;
    }

    const confirmar = confirm('¿Está seguro que desea eliminar este proyecto?');
    if (!confirmar) return;

    try {
      const success = await DeleteProyecto(id);

      if (success) {
        console.log('Proyecto eliminado exitosamente');

        this.cargarProyectos();

        alert('Proyecto eliminado exitosamente');
      } else {
        console.error('Error al eliminar el proyecto');
        alert('Error al eliminar el proyecto. Por favor, intente nuevamente.');
      }
    } catch (error) {
      console.error('Error en la solicitud de eliminación:', error);
      alert('Error al eliminar el proyecto. Por favor, intente nuevamente.');
    }
  }
  verifCant() {
    return this.proyectos$.value.length == 0;
  }


}