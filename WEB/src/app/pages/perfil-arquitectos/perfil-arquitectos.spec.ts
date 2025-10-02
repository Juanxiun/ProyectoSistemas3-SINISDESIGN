import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilArquitectos } from './perfil-arquitectos';

describe('PerfilArquitectos', () => {
  let component: PerfilArquitectos;
  let fixture: ComponentFixture<PerfilArquitectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilArquitectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilArquitectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
