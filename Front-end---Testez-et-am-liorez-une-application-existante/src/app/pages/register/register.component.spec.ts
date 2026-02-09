import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: { register: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    userServiceMock = {
      register: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with 4 fields', () => {
    expect(component.registerForm.contains('firstName')).toBe(true);
    expect(component.registerForm.contains('lastName')).toBe(true);
    expect(component.registerForm.contains('login')).toBe(true);
    expect(component.registerForm.contains('password')).toBe(true);
  });

  it('should call register and navigate on valid submit', () => {
    userServiceMock.register.mockReturnValue(of({}));
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass123',
    });
    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass123',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should reset form on onReset', () => {
    component.submitted = true;
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass123',
    });

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.get('firstName')?.value).toBeNull();
  });
});
