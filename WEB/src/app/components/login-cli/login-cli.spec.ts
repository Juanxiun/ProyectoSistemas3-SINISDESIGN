import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCli } from './login-cli';

describe('LoginCli', () => {
  let component: LoginCli;
  let fixture: ComponentFixture<LoginCli>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCli]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCli);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
