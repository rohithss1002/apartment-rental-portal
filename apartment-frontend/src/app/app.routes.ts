import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [

  // ---- Default: go to units browse page (no login needed) ----
  {
    path: '',
    redirectTo: 'units',
    pathMatch: 'full'
  },

  // ---- Public routes (no auth required) ----
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register)
  },

  // ---- Units browse: PUBLIC (no authGuard) ----
  {
    path: 'units',
    loadComponent: () =>
      import('./units/units').then(m => m.Units)
  },

  // ---- Unit detail: PUBLIC ----
  {
    path: 'unit/:id',
    loadComponent: () =>
      import('./pages/unit-details/unit-details').then(m => m.UnitDetails)
  },

  // ---- Protected routes ----
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
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
    redirectTo: 'units'
  }
];