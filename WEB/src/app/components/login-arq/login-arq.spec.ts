import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginArq } from './login-arq';

describe('LoginArq', () => {
  let component: LoginArq;
  let fixture: ComponentFixture<LoginArq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginArq]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginArq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
