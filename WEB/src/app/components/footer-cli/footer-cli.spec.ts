import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterCli } from './footer-cli';

describe('FooterCli', () => {
  let component: FooterCli;
  let fixture: ComponentFixture<FooterCli>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterCli]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterCli);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
