import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="logo">🏢 Apartment Portal</div>

      <nav class="nav">
        <!-- Common -->
        <a routerLink="/dashboard">Dashboard</a>

        <a *ngIf="auth.isAdmin()" routerLink="/admin">Admin</a>

      </nav>

      <div class="actions">
        <span class="role">{{ auth.getRole() | uppercase }}</span>
        <button (click)="auth.logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: #0f172a;
      color: white;
    }
    .nav a {
      margin-right: 16px;
      color: white;
      text-decoration: none;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    button {
      background: #ef4444;
      border: none;
      padding: 6px 12px;
      color: white;
      cursor: pointer;
    }
    .role {
      font-size: 12px;
      opacity: 0.8;
    }
  `]
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}
}
