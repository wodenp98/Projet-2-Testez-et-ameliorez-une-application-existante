import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudent, UpdateStudent } from '../models/Student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = '/api/students';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.API_URL);
  }

  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.API_URL}/${id}`);
  }

  create(student: CreateStudent): Observable<Student> {
    return this.httpClient.post<Student>(this.API_URL, student);
  }

  update(id: number, student: UpdateStudent): Observable<Student> {
    return this.httpClient.put<Student>(`${this.API_URL}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`);
  }
}
