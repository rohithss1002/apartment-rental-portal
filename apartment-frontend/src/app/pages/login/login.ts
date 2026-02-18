import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrapper">
    <div class="auth-card">

      <h2>{{ isLogin ? 'Sign In' : 'Create Account' }}</h2>

      <form (ngSubmit)="submit()">

        <div *ngIf="!isLogin" class="form-group">
          <input
            type="text"
            [(ngModel)]="fullName"
            name="fullName"
            placeholder="Full Name"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="Email"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>

        <button type="submit">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>

      </form>

      <div class="switch-mode">
        <span *ngIf="isLogin">
          Don't have an account?
          <a (click)="toggle()">Register</a>
        </span>

        <span *ngIf="!isLogin">
          Already have an account?
          <a (click)="toggle()">Login</a>
        </span>
      </div>

      <div *ngIf="error" class="error-msg">
        {{ error }}
      </div>

    </div>
  </div>
  `,
  styles: [`
    .auth-wrapper {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg,#667eea,#764ba2);
      font-family: Inter, system-ui;
    }

    .auth-card {
      background: #fff;
      padding: 40px;
      width: 350px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    h2 {
      text-align: center;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    button {
      width: 100%;
      padding: 10px;
      border-radius: 6px;
      border: none;
      background: linear-gradient(135deg,#667eea,#764ba2);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .switch-mode {
      margin-top: 16px;
      text-align: center;
      font-size: 14px;
    }

    .switch-mode a {
      color: #667eea;
      cursor: pointer;
      font-weight: 600;
    }

    .error-msg {
      margin-top: 12px;
      color: red;
      text-align: center;
    }
  `]
})
export class Login {

  isLogin = true;

  fullName = '';
  email = '';
  password = '';
  error = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  toggle() {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  submit() {

    if (this.isLogin) {
      this.api.login(this.email, this.password).subscribe({
        next: (res: any) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('role', res.role);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error = 'Invalid credentials';
        }
      });

    } else {
      this.api.register(this.fullName, this.email, this.password).subscribe({
        next: (res: any) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('role', res.role);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error = 'Registration failed';
        }
      });
    }
  }
}
