import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },

  {
    path: 'admin',
    canActivate: [
      authGuard,
      roleGuard(['admin'])
    ],
    loadComponent: () =>
      import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: 'towers',
        loadComponent: () =>
          import('./pages/admin/towers/towers').then(m => m.Towers)
      },
      {
        path: 'units',
        loadComponent: () =>
          import('./pages/admin/units/units').then(m => m.Units)
      },
      {
        path: 'flats',
        loadComponent: () =>
          import('./pages/admin/flats/flats').then(m => m.Flats)
      },
      {
        path: '',
        redirectTo: 'towers',
        pathMatch: 'full'
      }
    ]
  }
];
