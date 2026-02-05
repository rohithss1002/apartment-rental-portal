import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const role = localStorage.getItem('role');

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
