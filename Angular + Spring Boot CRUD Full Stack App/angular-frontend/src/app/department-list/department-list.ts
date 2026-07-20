import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Departments } from '../departments';
import { Department } from '../department';
import { User } from '../user';
import { SweetAlert } from '../sweet-alert';
import { filter, Subscription } from 'rxjs';
import { EmployeeRefresh } from '../employee-refresh';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css',
})
export class DepartmentList implements OnInit, OnDestroy {

  departmentss: Departments[] = [];
  supervisors: any[] = [];
  selectedDepartmentId: number = 0;
  selectedSupervisorId: number = 0;
  private refreshSub?: Subscription;
  private signalSub?: Subscription;

  constructor(
    private department: Department,
    private user: User,
    private route: ActivatedRoute,
    private router: Router,
    private sweetAlert: SweetAlert,
    private employeeRefresh: EmployeeRefresh,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadSupervisors();

    this.refreshSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        if (navigation.urlAfterRedirects.startsWith('/departments')) {
          this.loadDepartments();
          this.loadSupervisors();
        }
      });

    this.signalSub = this.employeeRefresh.refresh$.subscribe(() => {
      this.loadDepartments();
      this.loadSupervisors();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.signalSub?.unsubscribe();
  }

  loadDepartments(): void {
    this.department.getAllDepartments().subscribe({
      next: (data) => {
        this.departmentss = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadSupervisors(): void {
    this.user.getUsersByRole('SUPERVISOR').subscribe({
      next: (data) => {
        this.supervisors = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading supervisors:', err)
    });
  }

  getSupervisorEmail(supervisorId: number): string {
    const supervisor = this.supervisors.find(s => s.id === supervisorId);
    return supervisor ? supervisor.email : 'Not Assigned';
  }

  createSupervisor(departmentId: number): void {
    this.router.navigate(['/create-user'], {
      queryParams: {
        role: 'SUPERVISOR',
        departmentId,
        returnTo: 'departments'
      }
    });
  }

  openAssignSupervisor(departmentId: number): void {
    this.selectedDepartmentId = departmentId;
    this.selectedSupervisorId = 0;
  }

  assignSupervisor(): void {
    if (!this.selectedDepartmentId || !this.selectedSupervisorId) {
      void this.sweetAlert.error('Please select a supervisor to assign.');
      return;
    }

    this.department.assignSupervisor(this.selectedDepartmentId, this.selectedSupervisorId).subscribe({
      next: () => {
        void this.sweetAlert.success('Supervisor assigned successfully.');
        this.loadDepartments();
        this.loadSupervisors();
      },
      error: (err) => {
        void this.sweetAlert.error(err.error?.message || 'Failed to assign supervisor');
      }
    });
  }

  async deleteDepartment(id: number): Promise<void> {
    const confirmed = await this.sweetAlert.confirmDelete('department');
    if (!confirmed) return;

    this.department.deleteDepartment(id).subscribe({
      next: async () => {
        await this.sweetAlert.success('Department deleted successfully.');
        this.loadDepartments();
      },
      error: (err) => {
        void this.sweetAlert.error(err.error?.message || 'Failed to delete department');
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/create-department']);
  }
}
