import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagInfo } from './pag-info';

describe('PagInfo', () => {
  let component: PagInfo;
  let fixture: ComponentFixture<PagInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
