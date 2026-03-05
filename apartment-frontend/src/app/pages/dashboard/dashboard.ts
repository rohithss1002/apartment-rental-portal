import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="dashboard p-6">

      <!-- ===== STATS ===== -->
      <div class="top">
        <h2>Dashboard</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="label">Towers</div>
            <div class="num">{{ stats.towers ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Units</div>
            <div class="num">{{ stats.units ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Flats</div>
            <div class="num">{{ stats.flats ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Tenants</div>
            <div class="num">{{ stats.tenants ?? '—' }}</div>
          </div>
        </div>
      </div>

      <!-- ===== CHARTS + ACTIVITY ===== -->
      <div class="content-grid">
        <section class="card chart">
          <h3>Occupancy Trend</h3>
          <svg [attr.viewBox]="svgView" class="trend-svg" preserveAspectRatio="none">
            <path [attr.d]="trendPath" stroke="#2563eb" fill="none" stroke-width="2"></path>
            <g *ngFor="let p of svgPoints">
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="#2563eb"></circle>
            </g>
          </svg>
          <div class="months">
            <span *ngFor="let m of trend">{{ m.month }}</span>
          </div>
        </section>

        <section class="card activity">
          <h3>Recent Activity</h3>
          <ul>
            <li *ngFor="let a of activities">
              <div class="act-left">
                <div class="act-type">{{ a.type }}</div>
                <div class="act-title">{{ a.title }}</div>
              </div>
              <div class="act-right">
                <div class="act-user">{{ a.user }}</div>
                <div class="act-time">{{ a.time }}</div>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- ===== AVAILABLE UNITS ===== -->
      <section class="card units">
        <h3>Available Units</h3>

        <div *ngIf="units.length === 0">No units available.</div>

        <div *ngIf="bookingMessage" class="success-msg">
          {{ bookingMessage }}
        </div>

        <div class="unit-grid">
          <div class="unit-card" *ngFor="let unit of units">
            <h4>{{ unit.unit_number }}</h4>
            <p><strong>Tower:</strong> {{ unit.tower_name }}</p>
            <p><strong>Type:</strong> {{ unit.bhk_type }}</p>
            <p><strong>Rent:</strong> ₹{{ unit.rent }}</p>
            <p><strong>Status:</strong> {{ unit.status }}</p>
            <button
              (click)="book(unit.id)"
              [disabled]="unit.status !== 'AVAILABLE'">
              {{ unit.status === 'AVAILABLE' ? 'Book' : 'Not Available' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ===== BOOKING REQUESTS ===== -->
      <section class="card bookings">
        <h3>Booking Requests</h3>

        <div *ngIf="bookingLoading" class="loading-msg">Loading bookings...</div>

        <div *ngIf="!bookingLoading && bookings.length === 0" class="empty-msg">
          No booking requests found.
        </div>

        <table *ngIf="!bookingLoading && bookings.length > 0" class="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Unit</th>
              <th>Tower</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings">
              <td>#{{ b.booking_id }}</td>
              <td>{{ b.user_name }}</td>
              <td>{{ b.unit_number }}</td>
              <td>{{ b.tower }}</td>
              <td>{{ b.request_date | date:'mediumDate' }}</td>
              <td>
                <span class="badge"
                  [style.background]="b.status === 'PENDING' ? '#fef3c7' : b.status === 'APPROVED' ? '#d1fae5' : '#fee2e2'"
                  [style.color]="b.status === 'PENDING' ? '#d97706' : b.status === 'APPROVED' ? '#065f46' : '#dc2626'">
                  {{ b.status }}
                </span>
              </td>
              <td>
                <button
                  *ngIf="b.status === 'PENDING'"
                  class="approve-btn"
                  (click)="updateBooking(b.booking_id, 'APPROVED')">
                  ✓ Approve
                </button>
                <button
                  *ngIf="b.status === 'PENDING'"
                  class="decline-btn"
                  (click)="updateBooking(b.booking_id, 'DECLINED')">
                  ✗ Decline
                </button>
                <span *ngIf="b.status !== 'PENDING'" style="color:#9ca3af; font-size:12px;">
                  No actions
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

    </main>
  `,
  styles: [`
    .dashboard { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    h2 { font-size: 1.5rem; margin-bottom: 12px; }
    h3 { margin-bottom: 12px; }
    .top { display:flex; align-items:center; justify-content:space-between; }
    .stats { display:flex; gap:12px; }
    .stat-card { background:#fff; padding:12px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(2,6,23,0.06); min-width:120px; }
    .stat-card .label { font-size:12px; color:#6b7280; }
    .stat-card .num { font-size:1.25rem; font-weight:700; }

    .content-grid { display:grid; grid-template-columns: 2fr 1fr; gap:16px; margin-top:16px; }
    .card { background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 6px rgba(2,6,23,0.06); }
    .chart { display:flex; flex-direction:column; gap:8px; }
    .trend-svg { width:100%; height:160px; display:block; }
    .months { display:flex; justify-content:space-between; font-size:12px; color:#374151; }

    .activity ul { list-style:none; padding:0; margin:0; }
    .activity li { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f3f4f6; }
    .act-type { font-size:11px; color:#9ca3af; text-transform:uppercase; }
    .act-title { font-weight:600; }
    .act-user { font-size:12px; color:#6b7280; }
    .act-time { font-size:11px; color:#9ca3af; }

    .units { margin-top:20px; }
    .unit-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:16px; }
    .unit-card { background:#f9fafb; padding:16px; border-radius:8px; box-shadow:0 1px 6px rgba(2,6,23,0.06); }
    .unit-card h4 { margin:0 0 8px; }
    .unit-card p { margin:4px 0; font-size:13px; }
    .unit-card button { margin-top:10px; width:100%; padding:8px; border:none; border-radius:6px; background:#2563eb; color:#fff; cursor:pointer; font-size:13px; }
    .unit-card button:disabled { background:#e5e7eb; color:#9ca3af; cursor:not-allowed; }

    .success-msg { margin-bottom:10px; padding:10px; background:#d1fae5; color:#065f46; border-radius:6px; }
    .loading-msg { color:#6b7280; font-size:14px; }
    .empty-msg { color:#9ca3af; font-size:14px; }

    .bookings { margin-top:20px; }
    .bookings-table { width:100%; border-collapse:collapse; font-size:14px; }
    .bookings-table th { text-align:left; padding:10px 12px; background:#f9fafb; color:#6b7280; font-size:12px; text-transform:uppercase; border-bottom:1px solid #e5e7eb; }
    .bookings-table td { padding:10px 12px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
    .badge { padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
    .approve-btn { background:#22c55e; color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; margin-right:6px; font-size:12px; }
    .approve-btn:hover { background:#16a34a; }
    .decline-btn { background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
    .decline-btn:hover { background:#dc2626; }
  `]
})
export class Dashboard implements OnInit {

  // ---- Dashboard data ----
  stats: any = {};
  trend: Array<{ month: string; occupancy: number }> = [];
  activities: any[] = [];

  // ---- Units ----
  units: any[] = [];
  bookingMessage = '';

  // ---- Booking requests ----
  bookings: any[] = [];
  bookingLoading = false;

  // ---- SVG helpers ----
  svgView = '0 0 100 40';
  trendPath = '';
  svgPoints: Array<{ x: number; y: number }> = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadUnits();
    this.loadBookings();
    this.loadDashboard();
  }

  // ---- Load dashboard stats + trend + activity ----
  loadDashboard() {
    this.api.getDashboard().subscribe({
      next: (data) => { this.stats = data; },
      error: (err) => console.error(err)
    });

    this.api.getOccupancyTrend().subscribe({
      next: (data) => {
        this.trend = data;
        this.buildSvg();
      },
      error: (err) => console.error(err)
    });

    this.api.getRecentActivity().subscribe({
      next: (data) => { this.activities = data; },
      error: (err) => console.error(err)
    });
  }

  // ---- Load available units ----
  loadUnits() {
    this.api.getUnits().subscribe({
      next: (data) => { this.units = data; },
      error: (err) => console.error(err)
    });
  }

  // ---- Book a unit ----
  book(unitId: number) {
    this.api.bookUnit(unitId).subscribe({
      next: () => {
        this.bookingMessage = 'Booking request sent successfully!';
        this.loadUnits();
        setTimeout(() => this.bookingMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        alert('Booking failed');
      }
    });
  }

  // ---- Load all booking requests ----
  loadBookings() {
    this.bookingLoading = true;
    this.api.getAdminBookings().subscribe({
      next: (res) => {
        this.bookings = res.data ?? res;
        this.bookingLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.bookingLoading = false;
      }
    });
  }

  // ---- Approve or decline a booking ----
  updateBooking(id: number, status: string) {
    this.api.updateBookingStatus(id, status).subscribe({
      next: () => {
        alert(`Booking ${status.toLowerCase()} successfully`);
        this.loadBookings();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update booking');
      }
    });
  }

  // ---- Build SVG trend chart ----
  buildSvg() {
    if (!this.trend || this.trend.length === 0) return;

    const w = 100, h = 40, padding = 6;
    const values = this.trend.map(s => s.occupancy);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const xStep = w / Math.max(1, this.trend.length - 1);

    const points = this.trend.map((s, i) => ({
      x: i * xStep,
      y: h - padding - ((s.occupancy - min) / Math.max(1, max - min)) * (h - padding * 2)
    }));

    this.svgPoints = points;
    this.trendPath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }
}