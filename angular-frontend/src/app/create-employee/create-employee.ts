import { Component } from '@angular/core';
import { Employee } from '../employee';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Employeee } from '../employeee';
import { Router } from '@angular/router';

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
  
  constructor(private employeee: Employeee,
    private router: Router
  ) { }

  ngOnInit(): void {

  }
  validateGmailEmail(email: string): boolean {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailPattern.test(email || '');
  }

  onEmailInput(value: string) {
    if (!value || value.trim() === '') {
      this.emailError = 'Email is required.';
      return;
    }
    if (!this.validateGmailEmail(value.trim())) {
      this.emailError = 'Email must be a valid Gmail address (e.g., user@gmail.com)';
    } else {
      this.emailError = '';
    }
  }

  isEmailValid(): boolean {
    return this.validateGmailEmail(this.employee.emailId);
  }
  saveEmployee() {
    this.isLoading = true;
    this.employeee.createEmployee(this.employee).subscribe(
      data => {
        console.log('Employee created successfully:', data);
        alert('Employee created successfully!');
        this.isLoading = false;
        this.goToEmployeeList();
      },
      error => {
        console.error('Error creating employee:', error);
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to create employee';
        alert(`Error: ${errorMessage}`);
      }
    );
  }
  goToEmployeeList() {
    this.router.navigate(['/employees']);
  }
  onSubmit(form: NgForm) {
    this.submitted = true;
    
    // Validate form
    if (!form.valid) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    
    // Validate email format
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(this.employee.emailId)) {
      alert('Email must be a valid Gmail address (e.g., user@gmail.com)');
      return;
    }
    
    console.log('Form submitted:', this.employee);
    this.saveEmployee();
  }

}
