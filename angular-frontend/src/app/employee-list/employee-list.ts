import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { Employee } from '../employee';
import { Employeee } from '../employeee';
import { CommonModule, DatePipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../auth';
import { SweetAlert } from '../sweet-alert';
import { filter, Subscription } from 'rxjs';
import { EmployeeRefresh } from '../employee-refresh';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
})
export class EmployeeList implements OnInit, OnDestroy {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  role: string = '';
  departmentId: number = 0;
  showFilters: boolean = false;
  filterDob: string = '';
  filterStartDateFrom: string = '';
  filterStartDateTo: string = '';
  private refreshSub?: Subscription;
  private signalSub?: Subscription;

  constructor(
    private employeee: Employeee,
    private router: Router,
    private auth: Auth,
    private sweetAlert: SweetAlert,
    private employeeRefresh: EmployeeRefresh,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.loadEmployees(), 100);
    
    this.refreshSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        if (navigation.urlAfterRedirects.startsWith('/employees')) {
          
        }
      });

    this.signalSub = this.employeeRefresh.refresh$.subscribe(() => {
      
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.signalSub?.unsubscribe();
  }

  loadEmployees(): void {
    this.role = this.auth.getRole() || '';
    this.departmentId = this.auth.getDepartmentId();

    if (this.role === 'ADMIN') {
      // ADMIN sees all employees
      this.employeee.getEmployeeList().subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            this.employees = data;
            this.applyFilters();
          });
        },
        error: (err) => console.error('Error loading employees:', err)
      });
    } else {
      // SUPERVISOR and EMPLOYEE see only their department
      this.employeee.getEmployeesByDepartment(this.departmentId).subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            this.employees = data;
            this.applyFilters();
          });
        },
        error: (err) => console.error('Error loading employees:', err)
      });
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      // Clear filters when hiding panel
      this.filterDob = '';
      this.filterStartDateFrom = '';
      this.filterStartDateTo = '';
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredEmployees = this.employees.filter(emp => {
      // 1. Text Search
      const matchesText = !term ||
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.emailId.toLowerCase().includes(term);

      // 2. Date of Birth exact match (both compared as yyyy-MM-dd strings)
      const matchesDob = !this.filterDob || emp.dateOfBirth === this.filterDob;

      // 3. Start Date range
      let matchesStartDate = true;
      if (emp.startDate) {
        const empStartStr = emp.startDate.toString();
        if (this.filterStartDateFrom) {
          matchesStartDate = matchesStartDate && empStartStr >= this.filterStartDateFrom;
        }
        if (this.filterStartDateTo) {
          matchesStartDate = matchesStartDate && empStartStr <= this.filterStartDateTo;
        }
      } else if (this.filterStartDateFrom || this.filterStartDateTo) {
        matchesStartDate = false;
      }

      return matchesText && matchesDob && matchesStartDate;
    });

    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterDob = '';
    this.filterStartDateFrom = '';
    this.filterStartDateTo = '';
    this.applyFilters();
  }

  isAdminOrSupervisor(): boolean {
    return this.role === 'ADMIN' || this.role === 'SUPERVISOR';
  }

  viewEmployeeDetails(id: number): void {
    this.router.navigate(['employee-details', id]);
  }

  updateEmployee(id: number): void {
    this.router.navigate(['update-employee', id]);
  }

  async deleteEmployee(id: number): Promise<void> {
    const confirmed = await this.sweetAlert.confirmDelete('employee');
    if (!confirmed) return;

    this.employeee.deleteEmployee(id).subscribe({
      next: async () => {
        await this.sweetAlert.success('Employee deleted successfully.');
        this.loadEmployees();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || 'Unknown error';
        void this.sweetAlert.error(`Error deleting employee: ${errorMessage}`);
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

  exportExcel(): void {
    if (this.filteredEmployees.length === 0) {
      void this.sweetAlert.error('No employee data available to export.');
      return;
    }

    const dataToExport = this.filteredEmployees.map(emp => ({
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      'Email ID': emp.emailId,
      'Phone Number': emp.phoneNumber,
      'Address': emp.address,
      'Date of Birth': this.formatDate(emp.dateOfBirth)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    XLSX.writeFile(workbook, 'employees_list.xlsx');
  }

  exportPDF(): void {
    if (this.filteredEmployees.length === 0) {
      void this.sweetAlert.error('No employee data available to export.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Header Background
    doc.setFillColor(30, 58, 138); // #1e3a8a
    doc.rect(0, 0, 297, 30, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('UNIVERSITY OF VENDA', 15, 13);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('EMPLOYEE REPORT', 15, 22);

    // Metadata
    doc.setFontSize(10);
    const today = this.formatDate(new Date().toISOString());
    doc.text(`Generated: ${today}`, 230, 13);
    doc.text(`Total Records: ${this.filteredEmployees.length}`, 230, 20);

    const headers = [['First Name', 'Last Name', 'Email ID', 'Phone Number', 'Address', 'Date of Birth']];
    const rows = this.filteredEmployees.map(emp => [
      emp.firstName,
      emp.lastName,
      emp.emailId,
      emp.phoneNumber,
      emp.address,
      this.formatDate(emp.dateOfBirth)
    ]);

    autoTable(doc, {
      startY: 35,
      head: headers,
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40 },
        4: { cellWidth: 60 },
        5: { cellWidth: 35 }
      }
    });

    doc.save('employees_list.pdf');
  }
}

