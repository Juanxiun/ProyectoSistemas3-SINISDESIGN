import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ganancia } from './ganancia';

describe('Ganancia', () => {
  let component: Ganancia;
  let fixture: ComponentFixture<Ganancia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ganancia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ganancia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
