import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentServiceMock: { getById: jest.Mock; create: jest.Mock; update: jest.Mock };
  let router: Router;

  const mockStudent: Student = {
    id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com', created_at: '', updated_at: ''
  };

  function createComponent(routeId: string | null) {
    studentServiceMock = {
      getById: jest.fn().mockReturnValue(of(mockStudent)),
      create: jest.fn().mockReturnValue(of(mockStudent)),
      update: jest.fn().mockReturnValue(of(mockStudent)),
    };

    TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  describe('Create mode (no id param)', () => {
    beforeEach(() => createComponent(null));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with 3 fields', () => {
      expect(component.studentForm.contains('firstName')).toBe(true);
      expect(component.studentForm.contains('lastName')).toBe(true);
      expect(component.studentForm.contains('email')).toBe(true);
    });

    it('should be in create mode without id param', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should call create on submit in create mode', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.studentForm.setValue({
        firstName: 'Alice',
        lastName: 'Dupont',
        email: 'alice@mail.com',
      });
      component.onSubmit();

      expect(studentServiceMock.create).toHaveBeenCalledWith({
        firstName: 'Alice',
        lastName: 'Dupont',
        email: 'alice@mail.com',
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    });
  });

  describe('Edit mode (with id param)', () => {
    beforeEach(() => createComponent('1'));

    it('should be in edit mode with id param', () => {
      expect(component.isEditMode).toBe(true);
      expect(component.studentForm.get('firstName')?.value).toBe('Alice');
    });

    it('should call update on submit in edit mode', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.studentForm.setValue({
        firstName: 'Bob',
        lastName: 'Martin',
        email: 'bob@mail.com',
      });
      component.onSubmit();

      expect(studentServiceMock.update).toHaveBeenCalledWith(1, {
        firstName: 'Bob',
        lastName: 'Martin',
        email: 'bob@mail.com',
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    });
  });
});
