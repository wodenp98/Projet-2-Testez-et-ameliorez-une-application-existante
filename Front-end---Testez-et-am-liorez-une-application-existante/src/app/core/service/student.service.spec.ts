import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { Student } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(StudentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/students', () => {
    const mockStudents: Student[] = [
      { id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com', created_at: '', updated_at: '' },
      { id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob@mail.com', created_at: '', updated_at: '' },
    ];

    service.getAll().subscribe(students => {
      expect(students).toEqual(mockStudents);
    });

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  it('should call GET /api/students/1', () => {
    const mockStudent: Student = { id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com', created_at: '', updated_at: '' };

    service.getById(1).subscribe(student => {
      expect(student).toEqual(mockStudent);
    });

    const req = httpTesting.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudent);
  });

  it('should call POST /api/students', () => {
    const newStudent = { firstName: 'Alice', lastName: 'Dupont', email: 'alice@mail.com' };
    const createdStudent: Student = { id: 1, ...newStudent, created_at: '', updated_at: '' };

    service.create(newStudent).subscribe(student => {
      expect(student).toEqual(createdStudent);
    });

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush(createdStudent);
  });

  it('should call PUT /api/students/1', () => {
    const updateData = { firstName: 'Bob', lastName: 'Martin', email: 'bob@mail.com' };
    const updatedStudent: Student = { id: 1, ...updateData, created_at: '', updated_at: '' };

    service.update(1, updateData).subscribe(student => {
      expect(student).toEqual(updatedStudent);
    });

    const req = httpTesting.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(updatedStudent);
  });

  it('should call DELETE /api/students/1', () => {
    service.delete(1).subscribe();

    const req = httpTesting.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
