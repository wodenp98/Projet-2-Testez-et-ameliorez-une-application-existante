import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-detail.component.html',
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  student: Student | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStudent(id);
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student = student;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Student not found.';
          this.loading = false;
        }
      });
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }
}
