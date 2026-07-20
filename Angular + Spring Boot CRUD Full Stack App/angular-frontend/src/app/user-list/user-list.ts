import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../user';
import { Department } from '../department';
import { Departments } from '../departments';
import { SweetAlert } from '../sweet-alert';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  departmentss: Departments[] = [];
  searchTerm: string = '';

  constructor(
    private user: User,
    private department: Department,
    private router: Router,
    private sweetAlert: SweetAlert
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDepartments();
  }

  loadUsers(): void {
    this.user.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadDepartments(): void {
    this.department.getAllDepartments().subscribe({
      next: (data) => this.departmentss = data,
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departmentss.find(d => d.id === departmentId);
    return dept ? dept.name : 'Not Assigned';
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(u =>
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = this.users;
  }

  async deleteUser(id: number): Promise<void> {
    const confirmed = await this.sweetAlert.confirmDelete('user');
    if (!confirmed) return;

    this.user.deleteUser(id).subscribe({
      next: async () => {
        await this.sweetAlert.success('User deleted successfully.');
        this.loadUsers();
      },
      error: (err) => {
        void this.sweetAlert.error(err.error?.message || 'Failed to delete user');
      }
    });
  }

  updateUser(id: number): void { this.router.navigate(['/update-user', id]); }

  goToCreate(): void {
    this.router.navigate(['/create-user']);
  }
}

