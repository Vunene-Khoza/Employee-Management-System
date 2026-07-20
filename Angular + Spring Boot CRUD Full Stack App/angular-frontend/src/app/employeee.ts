import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from './employee';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Employeee {
  getAllEmployees() {
    throw new Error('Method not implemented.');
  }

  private baseURL = 'http://localhost:8080/api/v1/employees';

  constructor(private httpClient: HttpClient) {}

  private noCacheParam() {
    return { _ts: Date.now() };
  }

  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
  return this.httpClient.get<Employee[]>(
    `${this.baseURL}/department/${departmentId}`,
    { params: this.noCacheParam() }
  );
  }
  getEmployeeList(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(`${this.baseURL}`, {
      params: this.noCacheParam()
    });
  }
  createEmployee(employee: Employee): Observable<Object> {
    return this.httpClient.post(`${this.baseURL}`, employee);
  }
  getEmployeeById(id: number): Observable<Employee> {
    return this.httpClient.get<Employee>(`${this.baseURL}/${id}`, {
      params: this.noCacheParam()
    });
  }
  updateEmployee(id: number, employee: Employee): Observable<Object> {
    return this.httpClient.put(`${this.baseURL}/${id}`, employee);
  } 
  deleteEmployee(id: number): Observable<Object> {
    return this.httpClient.delete(`${this.baseURL}/${id}`);
  }
  
}
