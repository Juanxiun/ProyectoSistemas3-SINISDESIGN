import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleProyectos } from './detalle-proyectos';

describe('DetalleProyectos', () => {
  let component: DetalleProyectos;
  let fixture: ComponentFixture<DetalleProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProyectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleProyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
