import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { CreateStudent, UpdateStudent } from '../../../core/models/Student';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;
  studentId: number | null = null;

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentId = Number(id);
      this.loadStudent(this.studentId);
    }
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
          });
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load student.';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.studentForm.invalid) {
      return;
    }

    this.loading = true;
    const studentData = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value,
    };

    if (this.isEditMode && this.studentId) {
      const updateData: UpdateStudent = studentData;
      this.studentService.update(this.studentId, updateData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/students']);
          },
          error: () => {
            this.errorMessage = 'Failed to update student.';
            this.loading = false;
          }
        });
    } else {
      const createData: CreateStudent = studentData;
      this.studentService.create(createData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/students']);
          },
          error: () => {
            this.errorMessage = 'Failed to create student.';
            this.loading = false;
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }

  get form() {
    return this.studentForm.controls;
  }
}
