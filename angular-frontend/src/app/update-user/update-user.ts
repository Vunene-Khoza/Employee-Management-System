import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user';
import { Department } from '../department';
import { Departments } from '../departments';
import { SweetAlert } from '../sweet-alert';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-user.html',
  styleUrls: ['./update-user.css']
})
export class UpdateUser implements OnInit {

  id: number = 0;
  email: string = '';
  password: string = '';
  role: string = 'EMPLOYEE';
  departmentId: number = 0;
  departmentss: Departments[] = [];

  emailError: string = '';
  departmentError: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoaded: boolean = false;
  loadError: string = '';

  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private userService: User,
    private department: Department,
    private route: ActivatedRoute,
    private router: Router,
    private sweetAlert: SweetAlert,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDepartments();
    this.loadUser();
  }

  loadUser(): void {
    this.isLoaded = false;
    this.loadError = '';
    this.userService.getUserById(this.id).subscribe({
      next: (data) => {
        this.email = data.email;
        this.role = data.role;
        this.departmentId = data.departmentId || 0;
        this.isLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.loadError = 'Failed to load user details.';
        this.isLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadDepartments(): void {
    this.department.getAllDepartments().subscribe({
      next: (data) => this.departmentss = data,
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

  onSubmit(): void {
    this.validateEmail();
    if (this.emailError) return;

    this.isLoading = true;
    const userData = {
      email: this.email.trim(),
      role: this.role,
      departmentId: this.departmentId > 0 ? this.departmentId : null
    };

    if (this.password && this.password.trim() !== '') {
      (userData as any).password = this.password;
    }

    this.userService.updateUser(this.id, userData).subscribe({
      next: () => {
        void this.sweetAlert.success('User updated successfully.');
        this.isLoading = false;
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update user';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
