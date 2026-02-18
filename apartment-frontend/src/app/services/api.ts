import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, delay, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = 'https://apartment-api-682540295123.asia-south1.run.app';

  constructor(private http: HttpClient) {}

  // ---------------- AUTH ----------------

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, {
      email,
      password
    });
  }

  register(fullName: string, email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/register`, {
      full_name: fullName,
      email,
      password
    });
  }

  // ---------------- TOKEN HEADER ----------------

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ---------------- UNITS ----------------

  getUnits() {
    return this.http.get<any[]>(`${this.baseUrl}/units`);
  }

  getUnitDetails(id: number) {
    return this.http.get<any>(`${this.baseUrl}/units/${id}`);
  }

  bookUnit(unitId: number) {
    return this.http.post(
      `${this.baseUrl}/book`,
      { unit_id: unitId },
      { headers: this.getAuthHeaders() }
    );
  }

  // ---------------- ADMIN ----------------

  getAllBookings() {
    return this.http.get<any[]>(`${this.baseUrl}/admin/bookings`);
  }

  updateBooking(id: number, status: string) {
    return this.http.put(
      `${this.baseUrl}/admin/bookings/${id}`,
      { status }
    );
  }

  getAdminOverview() {
    return this.http.get<any>(
      `${this.baseUrl}/admin/overview`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ---------------- DASHBOARD (Mock fallback) ----------------

  getDashboard() {
    return this.http.get<any>(`${this.baseUrl}/dashboard`).pipe(
      catchError(() => {
        const mock = {
          towers: 4,
          units: 124,
          flats: 312,
          tenants: 256,
          bookingsPending: 7,
          occupancyRate: 82
        };
        return of(mock).pipe(delay(300));
      })
    );
  }

  getOccupancyTrend() {
    return this.http.get<any>(`${this.baseUrl}/dashboard/occupancy`).pipe(
      catchError(() => {
        const trend = [
          { month: 'Aug', occupancy: 75 },
          { month: 'Sep', occupancy: 78 },
          { month: 'Oct', occupancy: 80 },
          { month: 'Nov', occupancy: 79 },
          { month: 'Dec', occupancy: 81 },
          { month: 'Jan', occupancy: 82 }
        ];
        return of(trend).pipe(delay(200));
      })
    );
  }

  getRecentActivity() {
    return this.http.get<any>(`${this.baseUrl}/dashboard/activity`).pipe(
      catchError(() => {
        const activities = [
          { type: 'booking', title: 'New booking request — Flat A-102', user: 'alice@test.com', time: '2 hours ago' },
          { type: 'payment', title: 'Payment received — Unit 3B', user: 'bob@test.com', time: '6 hours ago' },
          { type: 'tenant', title: 'Tenant moved in — Flat C-201', user: 'charlie@test.com', time: '1 day ago' },
          { type: 'admin', title: 'Tower settings updated', user: 'admin@test.com', time: '2 days ago' }
        ];
        return of(activities).pipe(delay(250));
      })
    );
  }
}
