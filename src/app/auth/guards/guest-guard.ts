import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../Services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(Auth);
  const router = inject(Router);

  if(authService.isLoggedIn()){
    router.navigate(['/products-api']);
    return false;
  }

  return true;
};
