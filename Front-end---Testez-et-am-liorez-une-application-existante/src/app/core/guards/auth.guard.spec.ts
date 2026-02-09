import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { UserService } from '../service/user.service';

describe('authGuard', () => {
  let userServiceMock: { isLoggedIn: jest.Mock };
  let router: Router;

  beforeEach(() => {
    userServiceMock = { isLoggedIn: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should allow access when logged in', () => {
    userServiceMock.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect to /login when not logged in', () => {
    userServiceMock.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
