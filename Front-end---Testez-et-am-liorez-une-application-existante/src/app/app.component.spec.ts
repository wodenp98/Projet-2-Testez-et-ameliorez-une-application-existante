import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { UserService } from './core/service/user.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let userServiceMock: { isLoggedIn: jest.Mock; logout: jest.Mock };
  let routerNavigateSpy: jest.SpyInstance;

  beforeEach(async () => {
    userServiceMock = {
      isLoggedIn: jest.fn(),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    routerNavigateSpy = jest.spyOn((component as any).router, 'navigate');
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should return true when logged in', () => {
    userServiceMock.isLoggedIn.mockReturnValue(true);
    expect(component.isLoggedIn).toBe(true);
  });

  it('should call logout and navigate to login', () => {
    component.logout();

    expect(userServiceMock.logout).toHaveBeenCalled();
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
