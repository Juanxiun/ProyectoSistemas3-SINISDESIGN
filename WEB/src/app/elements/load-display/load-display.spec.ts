import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDisplay } from './load-display';

describe('LoadDisplay', () => {
  let component: LoadDisplay;
  let fixture: ComponentFixture<LoadDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
