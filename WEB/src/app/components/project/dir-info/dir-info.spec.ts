import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirInfo } from './dir-info';

describe('DirInfo', () => {
  let component: DirInfo;
  let fixture: ComponentFixture<DirInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
