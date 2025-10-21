import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaReunion } from './nueva-reunion';

describe('NuevaReunion', () => {
  let component: NuevaReunion;
  let fixture: ComponentFixture<NuevaReunion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaReunion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaReunion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
