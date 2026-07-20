import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  email = '';
  password = '';
  role = 'ADMIN';
  errorMessage = '';
  successMessage = '';
  emailError = '';
  passwordError = '';

  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  constructor(private auth: Auth, private router: Router) {}


  validateEmail(): void {
    if (!this.email) {
      this.emailError = 'Email is required';
    } else if (!this.emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  validatePassword(): void {
    if (!this.password) {
      this.passwordError = 'Password is required';
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
    } else {
      this.passwordError = '';
    }
  }

  onRegister() {
    this.validateEmail();
    this.validatePassword();
    if (this.emailError || this.passwordError) return;

    this.auth.register(this.email, this.password, this.role).subscribe({
      next: () => {
        this.successMessage = 'Registered successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }

}
