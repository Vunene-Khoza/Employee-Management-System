import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Employeee } from '../employeee';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../employee';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Auth } from '../auth';
import { finalize, timeout } from 'rxjs';
import { SweetAlert } from '../sweet-alert';
import { EmployeeRefresh } from '../employee-refresh';

@Component({
  selector: 'app-update-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-employee.html',
  styleUrls: ['./update-employee.css'],
})
export class UpdateEmployee implements OnInit {

  id: number = 0;
  employee: Employee = new Employee();
  submitted = false;
  isLoading = false;
  emailError: string = '';
  phoneError: string = '';
  dobError: string = '';
  isLoaded = false;
  loadError: string = '';
  fileError: string = '';

  private phoneRegex = /^0[0-9]{9}$/;
  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private employeee: Employeee,
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private sweetAlert: SweetAlert,
    private employeeRefresh: EmployeeRefresh,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!idParam || Number.isNaN(this.id) || this.id <= 0) {
      console.error('Invalid employee id in route:', idParam);
      this.loadError = 'Invalid employee selected.';
      this.isLoaded = true;
      this.cdr.detectChanges();
      return;
    }

    this.loadEmployee(this.id);
  }

  private loadEmployee(id: number): void {
    this.isLoaded = false;
    this.loadError = '';

    this.employeee
      .getEmployeeById(id)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.isLoaded = true;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.employee = {
            ...new Employee(),
            ...(data || {}),
            dateOfBirth: data?.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
          };

          this.onEmailInput(this.employee.emailId);
          this.onPhoneInput(this.employee.phoneNumber);
          this.onDobInput(this.employee.dateOfBirth);
        },
        error: (err) => {
          console.error('Error fetching employee:', err.status, err.message, err.error);
          this.loadError = 'Could not load employee details. You can refresh or go back to the employee list.';
        }
      });
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

  // pre-fill department for SUPERVISOR
/*  const role = this.auth.getRole();
  if (role === 'SUPERVISOR' && !this.employee.departmentId) {
    this.employee.departmentId = this.auth.getDepartmentId();
  }
}*/

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
    this.employeee.updateEmployee(this.id, this.employee).subscribe(
      data => {
        console.log('Employee updated successfully:', data);
        this.isLoading = false;
        void this.sweetAlert
          .success('Employee information updated successfully.')
          .then(() => this.goToEmployeeList());
      },
      error => {
        console.error('Error updating employee:', error.status, error.message, error.error);
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to update employee';
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
