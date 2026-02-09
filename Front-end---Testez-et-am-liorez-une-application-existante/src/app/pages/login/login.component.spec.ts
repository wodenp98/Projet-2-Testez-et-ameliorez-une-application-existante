import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceMock: { login: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    userServiceMock = {
      login: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with 2 fields', () => {
    expect(component.loginForm.contains('login')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  it('should call login and navigate on valid submit', () => {
    userServiceMock.login.mockReturnValue(of('fake-token'));
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.loginForm.setValue({ login: 'jdoe', password: 'pass123' });
    component.onSubmit();

    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'jdoe', password: 'pass123' });
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });
});
