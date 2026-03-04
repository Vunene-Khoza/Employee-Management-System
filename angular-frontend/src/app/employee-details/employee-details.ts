import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../employee';
import { Employeee } from '../employeee';

@Component({
  selector: 'app-employee-details',
  imports: [],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css'],
})
export class EmployeeDetails implements OnInit {

  id: number = 0;
  //employee: string = "";
  employee: Employee = new Employee();
  constructor(private route: ActivatedRoute, private employeee: Employeee) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.employee = new Employee();
    this.employeee.getEmployeeById(this.id).subscribe(data => {
      this.employee = data;
    });
  }

}
