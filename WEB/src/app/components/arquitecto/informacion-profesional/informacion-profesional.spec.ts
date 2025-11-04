import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionProfesional } from './informacion-profesional';

describe('InformacionProfesional', () => {
  let component: InformacionProfesional;
  let fixture: ComponentFixture<InformacionProfesional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionProfesional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionProfesional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
