import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string, role: string, departmentId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { email, password, role, departmentId });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  saveSession(token: string, email: string, role: string, userId: number, departmentId: number): void {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('departmentId', departmentId.toString());
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getDepartmentId(): number {
    return Number(localStorage.getItem('departmentId'));
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }
  
}
