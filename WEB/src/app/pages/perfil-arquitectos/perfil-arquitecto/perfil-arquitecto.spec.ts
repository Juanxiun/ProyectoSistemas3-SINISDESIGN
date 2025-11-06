import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilArquitecto } from './perfil-arquitecto';

describe('PerfilArquitecto', () => {
  let component: PerfilArquitecto;
  let fixture: ComponentFixture<PerfilArquitecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilArquitecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilArquitecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
