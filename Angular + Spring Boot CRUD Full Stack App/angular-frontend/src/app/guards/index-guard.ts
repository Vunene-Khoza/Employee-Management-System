import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';

export const indexGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (auth.getRole() === 'ADMIN') {
    return router.parseUrl('/departments');
  }

  return router.parseUrl('/employees');
};
