import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarArquitecto } from './editar-arquitecto';

describe('EditarArquitecto', () => {
  let component: EditarArquitecto;
  let fixture: ComponentFixture<EditarArquitecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarArquitecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarArquitecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
