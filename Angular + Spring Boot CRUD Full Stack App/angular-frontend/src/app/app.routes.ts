import { Routes,RouterModule } from '@angular/router';
import { EmployeeList } from './employee-list/employee-list';   
import { NgModule } from '@angular/core';
import { CreateEmployee } from './create-employee/create-employee';
import { UpdateEmployee } from './update-employee/update-employee';
import { EmployeeDetails } from './employee-details/employee-details';
import { Login } from './login/login';
import { Register } from './register/register';
import { DepartmentList } from './department-list/department-list';
import { CreateDepartment } from './create-department/create-department';
import { UserList } from './user-list/user-list';
import { CreateUser } from './create-user/create-user';
import { UpdateUser } from './update-user/update-user';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';
import { adminGuard } from './guards/admin-guard';
import { supervisorGuard } from './guards/supervisor-guard';

export const routes: Routes = [
  // protected routes
  { path: 'employees', component: EmployeeList, canActivate: [authGuard] },
  { path: 'create-employee', component: CreateEmployee, canActivate: [authGuard] },
  { path: 'update-employee/:id', component: UpdateEmployee, canActivate: [authGuard] },
  { path: 'employee-details/:id', component: EmployeeDetails, canActivate: [authGuard] },
  { path: 'departments', component: DepartmentList,   canActivate: [adminGuard] },
  { path: 'create-department', component: CreateDepartment, canActivate: [adminGuard] },
  { path: 'users', component: UserList, canActivate: [adminGuard] },
  { path: 'create-user', component: CreateUser, canActivate: [adminGuard] },
  { path: 'update-user/:id', component: UpdateUser, canActivate: [adminGuard] },

  // public routes
  { path: 'login', component: Login, canActivate: [noAuthGuard] },
  { path: 'register', component: Register, canActivate: [noAuthGuard] },

  // default / fallback
  { path: '', redirectTo: 'employees', pathMatch: 'full' },
  { path: '**', redirectTo: 'employees' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
