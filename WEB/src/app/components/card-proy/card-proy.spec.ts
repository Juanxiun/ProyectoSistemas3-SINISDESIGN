import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProy } from './card-proy';

describe('CardProy', () => {
  let component: CardProy;
  let fixture: ComponentFixture<CardProy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardProy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
