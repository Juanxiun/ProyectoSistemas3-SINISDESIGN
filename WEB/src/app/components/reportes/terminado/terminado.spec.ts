import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Terminado } from './terminado';

describe('Terminado', () => {
  let component: Terminado;
  let fixture: ComponentFixture<Terminado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terminado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Terminado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
