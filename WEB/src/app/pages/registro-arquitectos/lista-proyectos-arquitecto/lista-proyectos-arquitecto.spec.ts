import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProyectosArquitecto } from './lista-proyectos-arquitecto';

describe('ListaProyectosArquitecto', () => {
  let component: ListaProyectosArquitecto;
  let fixture: ComponentFixture<ListaProyectosArquitecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaProyectosArquitecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaProyectosArquitecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
