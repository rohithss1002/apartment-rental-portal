import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="login-wrapper">
    <div class="background-decoration"></div>

    <div class="login-card">
      <div class="logo-section">
        <div class="logo-icon">🏢</div>
        <h1>Create Account</h1>
        <p class="tagline">Join the Apartment Portal</p>
      </div>

      <form class="login-form">
        <div class="form-group">
          <label>Full Name</label>
          <input
            [(ngModel)]="fullName"
            name="fullName"
            placeholder="John Doe"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            [(ngModel)]="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            placeholder="••••••••"
            class="form-input"
          />
        </div>

        <button type="button" class="submit-btn" (click)="register()">
          Register
        </button>
      </form>

      <div class="success-alert" *ngIf="message">
        {{ message }}
      </div>

      <div class="error-alert" *ngIf="error">
        ⚠️ {{ error }}
      </div>

      <div class="divider"></div>

      <span>
        Already have an account?
        <a routerLink="/login">Sign In</a>
      </span>

    </div>
  </div>
`,
  styles: [`
    * { box-sizing: border-box; }

    .login-wrapper {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial;
    }

    .background-decoration {
      position: absolute;
      width: 500px;
      height: 500px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
      top: -100px;
      left: -100px;
    }

    .login-card {
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 420px;
      padding: 48px;
      z-index: 10;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }

    h1 {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
    }

    .tagline {
      font-size: 13px;
      color: #6b7280;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #374151;
      text-transform: uppercase;
    }

    .form-input {
      padding: 12px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
    }

    .submit-btn {
      margin-top: 10px;
      padding: 12px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .success-alert {
      margin-top: 12px;
      padding: 10px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 6px;
      font-size: 13px;
    }

    .error-alert {
      margin-top: 12px;
      padding: 10px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 6px;
      font-size: 13px;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 20px 0;
    }

    .login-link {
      text-align: center;
      font-size: 13px;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  message = '';
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  register() {
  this.api.register(this.fullName, this.email, this.password)
    .subscribe({
      next: (res: any) => {

        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('role', res.role);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || "Registration failed";
      }
    });
}

}
