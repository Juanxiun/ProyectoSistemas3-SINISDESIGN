import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecializacionesCreate } from './especializaciones-create';

describe('EspecializacionesCreate', () => {
  let component: EspecializacionesCreate;
  let fixture: ComponentFixture<EspecializacionesCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecializacionesCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspecializacionesCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
