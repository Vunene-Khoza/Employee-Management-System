import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {

    private baseUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getUsersByRole(role: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/role/${role}`);
  }

  createUser(email: string, password: string, role: string, departmentId?: number): Observable<any> {
    return this.http.post(this.baseUrl, { email, password, role, departmentId });
  }

  createSupervisor(email: string, password: string, departmentId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/supervisors`, { email, password, departmentId });
  }

  getSupervisors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/supervisors`);
  }

  getEmployeeAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/accounts/employees`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  
}
