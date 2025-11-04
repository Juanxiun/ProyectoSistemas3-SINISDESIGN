import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Especializaciones } from './especializaciones';

describe('Especializaciones', () => {
  let component: Especializaciones;
  let fixture: ComponentFixture<Especializaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Especializaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Especializaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
