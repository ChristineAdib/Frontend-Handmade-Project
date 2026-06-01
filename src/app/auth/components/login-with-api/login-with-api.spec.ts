import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginWithApi } from './login-with-api';

describe('LoginWithApi', () => {
  let component: LoginWithApi;
  let fixture: ComponentFixture<LoginWithApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginWithApi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginWithApi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
