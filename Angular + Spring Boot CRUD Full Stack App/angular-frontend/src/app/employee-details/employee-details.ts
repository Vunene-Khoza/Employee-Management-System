import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../employee';
import { Employeee } from '../employeee';
import { CommonModule, DatePipe } from '@angular/common';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, DatePipe],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css'],
})
export class EmployeeDetails implements OnInit {

  id: number = 0;
  employee: Employee = new Employee();
  isLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private employeee: Employeee,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.employee = new Employee();
    this.employeee.getEmployeeById(this.id).subscribe({
      next: (data) => {
        this.employee = data;
        this.isLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load employee details', err);
        this.isLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  downloadExcel(): void {
    const dataToExport = [{
      'Employee ID': this.employee.id,
      'First Name': this.employee.firstName,
      'Last Name': this.employee.lastName,
      'Email ID': this.employee.emailId,
      'Phone Number': this.employee.phoneNumber,
      'Address': this.employee.address,
      'Date of Birth': this.formatDate(this.employee.dateOfBirth),
      'Assigned Field': this.employee.field || 'N/A',
      'Start Date': this.employee.startDate ? this.formatDate(this.employee.startDate.toString()) : 'N/A'
    }];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Details');

    XLSX.writeFile(workbook, `employee_${this.employee.id}_details.xlsx`);
  }

  downloadPDF(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Brand Header banner
    doc.setFillColor(30, 58, 138); // #1e3a8a
    doc.rect(0, 0, 210, 35, 'F');

    // Accent line (Univen Gold)
    doc.setFillColor(212, 175, 55); // #d4af37
    doc.rect(0, 35, 210, 2, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('UNIVERSITY OF VENDA', 15, 16);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('INDIVIDUAL EMPLOYEE DETAILS PROFILE', 15, 26);

    // Metadata
    doc.setFontSize(9);
    const today = this.formatDate(new Date().toISOString());
    doc.text(`Exported: ${today}`, 155, 16);
    doc.text(`Employee ID: #${this.employee.id}`, 155, 24);

    // Content Styling
    doc.setTextColor(30, 58, 138); // #1e3a8a
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Personal Information', 15, 50);
    
    // Separator
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 53, 195, 53);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('First Name:', 15, 62);
    doc.text('Last Name:', 15, 70);
    doc.text('Date of Birth:', 15, 78);

    doc.setFont('helvetica', 'normal');
    doc.text(this.employee.firstName || '', 55, 62);
    doc.text(this.employee.lastName || '', 55, 70);
    doc.text(this.formatDate(this.employee.dateOfBirth) || '', 55, 78);

    // Section 2: Contact Information
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. Contact Details', 15, 95);
    doc.line(15, 98, 195, 98);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Email Address:', 15, 107);
    doc.text('Phone Number:', 15, 115);
    doc.text('Residential Address:', 15, 123);

    doc.setFont('helvetica', 'normal');
    doc.text(this.employee.emailId || '', 55, 107);
    doc.text(this.employee.phoneNumber || '', 55, 115);
    doc.text(this.employee.address || '', 55, 123);

    // Section 3: Professional Info
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. Employment Profile', 15, 140);
    doc.line(15, 143, 195, 143);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Assigned Field:', 15, 152);
    doc.text('Start Date:', 15, 160);

    doc.setFont('helvetica', 'normal');
    doc.text(this.employee.field || 'N/A', 55, 152);
    doc.text(this.employee.startDate ? this.formatDate(this.employee.startDate.toString()) : 'N/A', 55, 160);

    // Footer
    doc.setFillColor(30, 58, 138);
    doc.rect(15, 270, 180, 1, 'F');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('University of Venda - Confidential Employee Document', 15, 275);

    doc.save(`employee_${this.employee.id}_profile.pdf`);
  }
}