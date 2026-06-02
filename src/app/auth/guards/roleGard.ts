import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const userString = localStorage.getItem('user');

  if (!userString) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userString);

  const allowedRoles = route.data?.['roles'] as string[];

  const userRoles = user.roles || [];

  const hasAccess = userRoles.some((role: string) =>
    allowedRoles.includes(role)
  );

  if (hasAccess) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};