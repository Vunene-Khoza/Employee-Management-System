import { Component, OnInit } from '@angular/core';
import { Employeee } from '../employeee';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../employee';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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
  
  constructor(private employeee: Employeee,
    private route: ActivatedRoute,
    private router: Router){ }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.isLoading = true;
    this.employeee.getEmployeeById(this.id).subscribe(
      data => {
        this.employee = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading employee:', error);
        this.isLoading = false;
        alert('Error loading employee data. Please try again.');
        this.router.navigate(['/employees']);
      }
    );
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
    
    this.isLoading = true;
    this.employeee.updateEmployee(this.id, this.employee).subscribe(
      data => {
        console.log('Employee updated successfully:', data);
        this.isLoading = false;
        alert('Employee updated successfully!');
        this.goToEmployeeList();
      },
      error => {
        console.error('Error updating employee:', error);
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to update employee';
        alert(`Error: ${errorMessage}`);
      }
    );
  }

  goToEmployeeList() {
    this.router.navigate(['/employees']);
  }

}
