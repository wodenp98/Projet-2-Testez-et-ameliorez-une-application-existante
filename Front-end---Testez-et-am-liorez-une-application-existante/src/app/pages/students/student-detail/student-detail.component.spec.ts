import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentServiceMock: { getById: jest.Mock };
  let router: Router;

  const mockStudent: Student = {
    id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com', created_at: '2024-01-01', updated_at: '2024-01-01'
  };

  beforeEach(async () => {
    studentServiceMock = {
      getById: jest.fn().mockReturnValue(of(mockStudent)),
    };

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load student on init', () => {
    expect(studentServiceMock.getById).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(mockStudent);
  });

  it('should navigate to edit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.editStudent();
    expect(navigateSpy).toHaveBeenCalledWith(['/students', 1, 'edit']);
  });

  it('should go back to list', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });
});
