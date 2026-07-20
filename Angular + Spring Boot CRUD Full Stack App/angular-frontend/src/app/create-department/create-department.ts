import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Department } from '../department';
import { SweetAlert } from '../sweet-alert';

@Component({
  selector: 'app-create-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-department.html',
  styleUrl: './create-department.css',
})
export class CreateDepartment {

    name: string = '';
  nameError: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private department: Department,
    private router: Router,
    private sweetAlert: SweetAlert
  ) {}

  validateName(): void {
    if (!this.name || this.name.trim() === '') {
      this.nameError = 'Department name is required';
    } else if (this.name.trim().length < 3) {
      this.nameError = 'Department name must be at least 3 characters';
    } else {
      this.nameError = '';
    }
  }

  onSubmit(): void {
    this.validateName();
    if (this.nameError) return;

    this.isLoading = true;
    this.department.createDepartment(this.name.trim()).subscribe({
      next: () => {
        this.successMessage = 'Department created successfully! Redirecting...';
        this.isLoading = false;
        void this.sweetAlert
          .success('Department created successfully.')
          .then(() => {
            this.router.navigate(['/departments']).then(() => {
              window.location.reload();
            });
          });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create department';
        this.isLoading = false;
        void this.sweetAlert.error(this.errorMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/departments']);
  }

}
