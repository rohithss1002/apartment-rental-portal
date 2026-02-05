  import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { Router } from '@angular/router';
  import { ApiService } from '../../services/api';

  @Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-wrapper">
      <div class="background-decoration"></div>
      
      <div class="login-card">
        <div class="logo-section">
          <div class="logo-icon">🏢</div>
          <h1>Apartment Portal</h1>
          <p class="tagline">Residential Rental Management</p>
        </div>

        <form class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              [(ngModel)]="email"
              name="email"
              type="email"
              placeholder="admin@apartment.com"
              class="form-input"
            />
            <div class="hint">Demo: admin@apartment.com / admin123</div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              [(ngModel)]="password"
              name="password"
              type="password"
              placeholder="••••••••"
              class="form-input"
            />
            <div class="hint">Demo: admin@apartment.com / admin123</div>
          </div>

          <button type="button" class="submit-btn" (click)="login()">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing In...</span>
          </button>
        </form>

        <div class="error-alert" *ngIf="error">
          <span class="error-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <div class="divider">Or use test credentials</div>

        <div class="demo-creds">
          <div class="cred-box">
            <div class="cred-role">Admin</div>
            <div class="cred-email">admin@apartment.com</div>
            <div class="cred-pass">admin123</div>
          </div>
          <div class="cred-box">
            <div class="cred-role">User</div>
            <div class="cred-email">user@apartment.com</div>
            <div class="cred-pass">user123</div>
          </div>
        </div>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
      overflow: hidden;
    }

    .background-decoration {
      position: absolute;
      width: 500px;
      height: 500px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      top: -100px;
      left: -100px;
    }

    .background-decoration::after {
      content: '';
      position: absolute;
      width: 350px;
      height: 350px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      bottom: -80px;
      right: -80px;
    }

    .login-card {
      position: relative;
      z-index: 10;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 420px;
      padding: 48px;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
    }

    .tagline {
      color: #6b7280;
      font-size: 13px;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input {
      padding: 12px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: #f9fafb;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input::placeholder {
      color: #d1d5db;
    }

    .hint {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }

    .submit-btn {
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      color: #991b1b;
      font-size: 13px;
      animation: shake 0.3s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .error-icon {
      font-size: 16px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #d1d5db;
      font-size: 12px;
      margin: 20px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .demo-creds {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .cred-box {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
    }

    .cred-role {
      font-weight: 700;
      color: #667eea;
      margin-bottom: 4px;
    }

    .cred-email {
      color: #374151;
      font-family: monospace;
      margin-bottom: 2px;
    }

    .cred-pass {
      color: #6b7280;
      font-family: monospace;
    }
  `]

  })
  export class Login {

    email = '';
    password = '';
    error = '';
    loading = false;

    constructor(
      private api: ApiService,
      private router: Router
    ) {}

    login(): void {
      console.log('LOGIN CLICKED ✅');

      if (this.loading) return; // prevent double clicks

      if (!this.email || !this.password) {
        this.error = 'Email and password are required';
        return;
      }

      this.loading = true;
      this.error = '';

      console.log('Sending login request…');

      this.api.login(this.email, this.password).subscribe({
        next: (res: any) => {
          console.log('LOGIN RESPONSE ✅', res);
          this.loading = false;

          if (res?.access_token && res?.role) {
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('role', res.role);
            this.router.navigate(['/dashboard']);
          } else {
            this.error = 'Invalid response from server';
          }
        },
        error: (err: any) => {
          console.error('LOGIN ERROR ❌', err);
          this.loading = false;
          this.error =
            err?.error?.message ||
            'Invalid credentials or server error';
        }
      });
    }
  }
