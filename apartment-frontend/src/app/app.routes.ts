import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Units } from './units/units';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

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
    path: 'units',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./units/units').then(m => m.Units)
  },

  {
    path: 'unit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/unit-details/unit-details').then(m => m.UnitDetails)
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
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
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];

