import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    HeaderComponent
  ],
  template: `
    <app-header *ngIf="auth.isLoggedIn()"></app-header>
    
    <!-- Landing Page (when not logged in) -->
    <div *ngIf="!auth.isLoggedIn() && auth.isHomeRoute()" class="landing">
      <nav class="navbar">
        <div class="nav-content">
          <div class="logo">🏢 Apartment Portal</div>
          <a routerLink="/login" class="nav-login">Sign In</a>
        </div>
      </nav>

      <section class="hero">
        <div class="hero-content">
          <h1>Manage Your Residential Complex</h1>
          <p>Streamlined platform for towers, units, flats, and tenant management</p>
          <a routerLink="/login" class="cta-btn">Get Started</a>
        </div>
        <div class="hero-graphic">
          <div class="graphic-icon">🏗️</div>
        </div>
      </section>

      <section class="features">
        <h2>Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏛️</div>
            <h3>Tower Management</h3>
            <p>Organize and manage multiple towers with ease</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h3>Unit & Flat Tracking</h3>
            <p>Track every unit and flat with detailed information</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Tenant Management</h3>
            <p>Manage tenant profiles and lease agreements</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Booking System</h3>
            <p>Handle rental inquiries and booking approvals</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>View occupancy rates and payment insights</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔐</div>
            <h3>Secure Access</h3>
            <p>Role-based access for admins and tenants</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Ready to get started?</h2>
        <p>Sign in with your account or use demo credentials to explore</p>
        <a routerLink="/login" class="cta-btn-large">Access Portal</a>
      </section>

      <footer class="footer">
        <p>&copy; 2026 Apartment Rental Portal. All rights reserved.</p>
      </footer>
    </div>

    <!-- Routed pages (login, admin, etc.) -->
    <router-outlet></router-outlet>

  `,
  styles: [`
    :host { display: block; }

    /* Landing Page */
    .landing {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    }

    .navbar {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }

    .nav-login {
      padding: 8px 20px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .nav-login:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }

    /* Hero Section */
    .hero {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
    }

    .hero-content h1 {
      font-size: 48px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 16px;
      line-height: 1.2;
    }

    .hero-content p {
      font-size: 18px;
      color: #4b5563;
      margin: 0 0 24px;
      line-height: 1.6;
    }

    .cta-btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .cta-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }

    .hero-graphic {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }

    .graphic-icon {
      font-size: 120px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    /* Features Section */
    .features {
      max-width: 1200px;
      margin: 60px auto;
      padding: 0 24px;
    }

    .features h2 {
      font-size: 36px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
      margin: 0 0 48px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .feature-card {
      background: white;
      padding: 28px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      text-align: center;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .feature-card h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 12px 0;
    }

    .feature-card p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      line-height: 1.6;
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 24px;
      text-align: center;
      margin: 60px 0;
    }

    .cta-section h2 {
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 12px;
    }

    .cta-section p {
      font-size: 16px;
      margin: 0 0 24px;
      opacity: 0.95;
    }

    .cta-btn-large {
      display: inline-block;
      padding: 16px 40px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .cta-btn-large:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 24px;
      color: #6b7280;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.5);
    }

    .footer p { margin: 0; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; padding: 40px 24px; }
      .hero-content h1 { font-size: 32px; }
      .hero-graphic { height: 300px; }
      .graphic-icon { font-size: 80px; }
      .features h2 { font-size: 28px; }
      .cta-section h2 { font-size: 28px; }
    }
  `]
})
export class App {
  constructor(public auth: AuthService) {}
}
