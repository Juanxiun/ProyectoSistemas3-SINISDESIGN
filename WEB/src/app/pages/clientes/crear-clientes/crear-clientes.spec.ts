import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearClientes } from './crear-clientes';

describe('CrearClientes', () => {
  let component: CrearClientes;
  let fixture: ComponentFixture<CrearClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
