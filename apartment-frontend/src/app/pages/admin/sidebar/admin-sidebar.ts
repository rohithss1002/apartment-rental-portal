import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <h3>Admin</h3>

      <a routerLink="towers" routerLinkActive="active">Towers</a>
      <a routerLink="units" routerLinkActive="active">Units</a>
      <a routerLink="flats" routerLinkActive="active">Flats</a>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      background: #020617;
      color: white;
      padding: 16px;
    }
    a {
      display: block;
      color: white;
      text-decoration: none;
      margin: 12px 0;
    }
    .active {
      font-weight: bold;
      color: #38bdf8;
    }
  `]
})
export class AdminSidebarComponent {}
