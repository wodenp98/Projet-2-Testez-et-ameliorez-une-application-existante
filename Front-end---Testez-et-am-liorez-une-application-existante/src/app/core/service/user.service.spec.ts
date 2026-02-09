import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST /api/register', () => {
    const user = { firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pass123' };

    service.register(user).subscribe();

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({});
  });

  it('should call POST /api/login and save token', () => {
    const credentials = { login: 'jdoe', password: 'pass123' };

    service.login(credentials).subscribe();

    const req = httpTesting.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush('fake-token');

    expect(localStorage.getItem('jwt_token')).toBe('fake-token');
  });

  it('should save and get token', () => {
    service.saveToken('abc');
    expect(service.getToken()).toBe('abc');
  });

  it('should remove token on logout', () => {
    service.saveToken('abc');
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  it('should return true when logged in', () => {
    service.saveToken('abc');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when not logged in', () => {
    expect(service.isLoggedIn()).toBe(false);
  });
});
