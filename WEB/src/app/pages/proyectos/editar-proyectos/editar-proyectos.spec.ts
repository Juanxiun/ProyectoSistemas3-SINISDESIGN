import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProyectos } from './editar-proyectos';

describe('EditarProyectos', () => {
  let component: EditarProyectos;
  let fixture: ComponentFixture<EditarProyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProyectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarProyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
