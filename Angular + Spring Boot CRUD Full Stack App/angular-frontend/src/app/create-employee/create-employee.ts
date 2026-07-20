import { Component } from '@angular/core';
import { Employee } from '../employee';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Employeee } from '../employeee';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { SweetAlert } from '../sweet-alert';
import { EmployeeRefresh } from '../employee-refresh';

@Component({
  selector: 'app-create-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-employee.html',
  styleUrls: ['./create-employee.css'],
})
export class CreateEmployee {

  employee: Employee = new Employee();
  submitted = false;
  isLoading = false;
  emailError: string = '';
  phoneError: string = '';
  dobError: string = '';
  fileError: string = '';

  private phoneRegex = /^0[0-9]{9}$/;
  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private employeee: Employeee,
    private router: Router,
    private auth: Auth,
    private sweetAlert: SweetAlert,
    private employeeRefresh: EmployeeRefresh
  ) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    if (role === 'SUPERVISOR' || role === 'EMPLOYEE') {
      this.employee.departmentId = this.auth.getDepartmentId();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'File size exceeds 5MB limit.';
        return;
      }
      this.fileError = '';
      const reader = new FileReader();
      reader.onload = () => {
        this.employee.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Email ---
  onEmailInput(value: string) {
    if (!value || value.trim() === '') {
      this.emailError = 'Email is required.';
    } else if (!this.emailRegex.test(value.trim())) {
      this.emailError = 'Email must be a valid email address.';
    } else {
      this.emailError = '';
    }
  }

  isEmailValid(): boolean {
    return this.emailRegex.test(this.employee.emailId || '');
  }

  // --- Phone ---
  onPhoneInput(value: string) {
    if (!value || value.trim() === '') {
      this.phoneError = 'Phone number is required.';
    } else if (!this.phoneRegex.test(value.trim())) {
      this.phoneError = 'Enter a valid SA number (10 digits, starts with 0)';
    } else {
      this.phoneError = '';
    }
  }

  isPhoneValid(): boolean {
    return this.phoneRegex.test(this.employee.phoneNumber || '');
  }

  // --- Date of Birth ---
  onDobInput(value: string) {
    if (!value) {
      this.dobError = 'Date of birth is required.';
    } else {
      const dob = new Date(value);
      const today = new Date();
      if (dob >= today) {
        this.dobError = 'Date of birth must be in the past.';
      } else {
        this.dobError = '';
      }
    }
  }

  isDobValid(): boolean {
    if (!this.employee.dateOfBirth) return false;
    const dob = new Date(this.employee.dateOfBirth);
    return dob < new Date();
  }

  // --- Submit ---
  onSubmit(form: NgForm) {
    this.submitted = true;

    // trigger all validations manually on submit
    this.onEmailInput(this.employee.emailId);
    this.onPhoneInput(this.employee.phoneNumber);
    this.onDobInput(this.employee.dateOfBirth);

    if (!form.valid || !this.isEmailValid() || !this.isPhoneValid() || !this.isDobValid()) {
      return;
    }

    this.isLoading = true;
    this.employeee.createEmployee(this.employee).subscribe(
      data => {
        console.log('Employee created successfully:', data);
        this.isLoading = false;
        void this.sweetAlert
          .success('Employee added successfully.')
          .then(() => this.goToEmployeeList());
      },
      error => {
        console.error('Error creating employee:', error);
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to create employee';
        void this.sweetAlert.error(errorMessage);
      }
    );
  }

  goToEmployeeList() {
    this.employeeRefresh.trigger();
    this.router.navigate(['/employees'], {
      queryParams: { refresh: Date.now() }
    });
  }
}
