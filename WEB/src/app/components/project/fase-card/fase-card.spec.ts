import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseCard } from './fase-card';

describe('FaseCard', () => {
  let component: FaseCard;
  let fixture: ComponentFixture<FaseCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
