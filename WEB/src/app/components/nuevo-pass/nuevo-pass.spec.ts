import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoPass } from './nuevo-pass';

describe('NuevoPass', () => {
  let component: NuevoPass;
  let fixture: ComponentFixture<NuevoPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoPass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoPass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
