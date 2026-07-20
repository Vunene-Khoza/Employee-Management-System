import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../auth';

export const supervisorGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const role = auth.getRole();
  if (role === 'ADMIN' || role === 'SUPERVISOR') {
    return true;
  }
  router.navigate(['/employees']);
  return false;
};