import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarReunion } from './editar-reunion';

describe('EditarReunion', () => {
  let component: EditarReunion;
  let fixture: ComponentFixture<EditarReunion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarReunion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarReunion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
