import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyInfo } from './proy-info';

describe('ProyInfo', () => {
  let component: ProyInfo;
  let fixture: ComponentFixture<ProyInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
