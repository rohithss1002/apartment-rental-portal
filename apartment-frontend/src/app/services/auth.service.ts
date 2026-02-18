import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  // 🔐 LOGIN
  login(email: string, password: string) {
    return this.api.login(email, password);
  }

  saveAuth(token: string, role: string) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('role', role.toLowerCase());
  }

  // 🔍 AUTH STATE
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // 🛡 USED IN header.ts
  isAdmin(): boolean {
  return this.getRole() === 'admin';
}

}
