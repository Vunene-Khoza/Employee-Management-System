import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user';
import { Department } from '../department';
import { Departments } from '../departments';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css']
})
export class CreateUser implements OnInit {

  email: string = '';
  password: string = '';
  role: string = 'EMPLOYEE';
  departmentId: number = 0;
  departmentss: Departments[] = [];
  returnTo: string = 'users';

  emailError: string = '';
  passwordError: string = '';
  departmentError: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private user: User,
    private department: Department,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.route.queryParamMap.subscribe((params) => {
      const role = params.get('role');
      const departmentIdParam = Number(params.get('departmentId'));
      const returnToParam = params.get('returnTo');

      if (role === 'SUPERVISOR' || role === 'EMPLOYEE') {
        this.role = role;
      }

      if (!Number.isNaN(departmentIdParam) && departmentIdParam > 0) {
        this.departmentId = departmentIdParam;
      }

      if (returnToParam === 'departments' || returnToParam === 'users') {
        this.returnTo = returnToParam;
      }
    });
  }

  loadDepartments(): void {
    this.department.getAllDepartments().subscribe({
      next: (data) => {
        this.departmentss = data;
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  validateEmail(): void {
    if (!this.email || this.email.trim() === '') {
      this.emailError = 'Email is required';
    } else if (!this.emailRegex.test(this.email.trim())) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  validatePassword(): void {
    if (!this.password || this.password.trim() === '') {
      this.passwordError = 'Password is required';
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
    } else {
      this.passwordError = '';
    }
  }

  validateDepartment(): void {
    if (!this.departmentId || this.departmentId === 0) {
      this.departmentError = 'Please select a department';
    } else {
      this.departmentError = '';
    }
  }

  onSubmit(): void {
    this.validateEmail();
    this.validatePassword();
    this.validateDepartment();

    if (this.emailError || this.passwordError || this.departmentError) return;

    this.isLoading = true;
    const request$ = this.role === 'SUPERVISOR'
      ? this.user.createSupervisor(this.email.trim(), this.password, this.departmentId)
      : this.user.createUser(this.email.trim(), this.password, this.role, this.departmentId);

    request$.subscribe({
      next: () => {
        this.successMessage = this.role === 'SUPERVISOR'
          ? 'Supervisor created successfully! Redirecting...'
          : 'User created successfully! Redirecting...';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate([`/${this.returnTo}`], {
            queryParams: { refresh: Date.now() }
          });
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create user';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate([`/${this.returnTo}`]);
  }
}
