import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearProyectos } from './crear-proyectos';

describe('CrearProyectos', () => {
  let component: CrearProyectos;
  let fixture: ComponentFixture<CrearProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearProyectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearProyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
