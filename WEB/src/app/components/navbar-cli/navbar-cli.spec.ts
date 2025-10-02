import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCli } from './navbar-cli';

describe('NavbarCli', () => {
  let component: NavbarCli;
  let fixture: ComponentFixture<NavbarCli>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarCli]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarCli);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
