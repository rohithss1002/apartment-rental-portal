import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebarComponent
  ],
  template: `
    <div class="admin-container">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AdminLayout {}
