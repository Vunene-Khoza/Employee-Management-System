import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departments } from './departments';

@Injectable({
  providedIn: 'root',
})
export class Department {

  private baseUrl = 'http://localhost:8080/api/v1/departments';

  constructor(private http: HttpClient) {}

  private noCacheParam() {
    return { _ts: Date.now() };
  }

  getAllDepartments(): Observable<Departments[]> {
    return this.http.get<Departments[]>(this.baseUrl, {
      params: this.noCacheParam()
    });
  }

  getDepartmentById(id: number): Observable<Departments> {
    return this.http.get<Departments>(`${this.baseUrl}/${id}`, {
      params: this.noCacheParam()
    });
  }

  createDepartment(name: string): Observable<any> {
    return this.http.post(this.baseUrl, { name });
  }

  updateDepartment(id: number, name: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { name });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  assignSupervisor(departmentId: number, supervisorId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${departmentId}/assign-supervisor`,
      { supervisorId }
    );
  }
  
}
