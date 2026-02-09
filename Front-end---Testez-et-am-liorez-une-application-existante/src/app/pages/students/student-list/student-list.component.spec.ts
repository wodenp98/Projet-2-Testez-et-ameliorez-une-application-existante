import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceMock: { getAll: jest.Mock; delete: jest.Mock };
  let router: Router;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com', created_at: '', updated_at: '' },
    { id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob@mail.com', created_at: '', updated_at: '' },
  ];

  beforeEach(async () => {
    studentServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockStudents)),
      delete: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    expect(component.students).toEqual(mockStudents);
    expect(component.students.length).toBe(2);
  });

  it('should navigate to student detail', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.viewStudent(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/students', 1]);
  });

  it('should navigate to edit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.editStudent(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/students', 1, 'edit']);
  });

  it('should navigate to add', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.addStudent();
    expect(navigateSpy).toHaveBeenCalledWith(['/students/new']);
  });

  it('should delete and remove from list', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    studentServiceMock.delete.mockReturnValue(of(void 0));

    component.deleteStudent(1);

    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.students.length).toBe(1);
    expect(component.students.find(s => s.id === 1)).toBeUndefined();
  });
});
