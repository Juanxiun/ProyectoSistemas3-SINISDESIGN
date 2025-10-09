import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FasInfo } from './fas-info';

describe('FasInfo', () => {
  let component: FasInfo;
  let fixture: ComponentFixture<FasInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FasInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FasInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
