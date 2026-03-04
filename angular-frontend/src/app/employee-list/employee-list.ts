import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee';
import { Employeee } from '../employeee';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({  
  selector: 'app-employee-list',
  imports: [CommonModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
})
export class EmployeeList implements OnInit {

  employees: Employee[]=[];
  constructor(private employeee: Employeee,
    private router: Router) { }


  ngOnInit(): void {
    this.getEmployees();

  }
  private getEmployees() {
    this.employeee.getEmployeeList().subscribe(data => {
      this.employees = data;
    });
  }
  viewEmployeeDetails(id: number) {
    this.router.navigate(['employee-details', id]);
  } 
  updateEmployee(id: number) { 
    this.router.navigate(['update-employee', id]);
  }
  deleteEmployee(id: number) {
    this.employeee.deleteEmployee(id).subscribe(
      data => {
        console.log('Employee deleted successfully:', data);
        // Remove employee from local array
        this.employees = this.employees.filter(emp => emp.id !== id);
      },
      error => {
        console.error('Error deleting employee:', error);
        const errorMessage = error?.error?.message || error?.message || 'Unknown error';
        alert(`Error deleting employee: ${errorMessage}`);
      }
    );
  }

}
