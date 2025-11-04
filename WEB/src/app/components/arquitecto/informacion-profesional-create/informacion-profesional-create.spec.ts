import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionProfesionalCreate } from './informacion-profesional-create';

describe('InformacionProfesionalCreate', () => {
  let component: InformacionProfesionalCreate;
  let fixture: ComponentFixture<InformacionProfesionalCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionProfesionalCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionProfesionalCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
