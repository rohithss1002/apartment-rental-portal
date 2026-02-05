import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, delay, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'https://apartment-api-682540295123.asia-south1.run.app';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
  return this.mockLogin(email, password);
}




  // Dashboard stats: try real backend, fallback to mock
  getDashboard() {
    return this.http.get<any>(`${this.baseUrl}/dashboard`).pipe(
      catchError(() => {
        // Mock dashboard data
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

  // Occupancy trend (last 6 months) - backend or mock
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

  // Recent activity list - backend or mock
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

  getAdminOverview() {
  const token = localStorage.getItem('access_token');

  return this.http.get<any>(`${this.baseUrl}/admin/overview`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


  // Mock login for testing without backend
   private mockLogin(email: string, password: string) {
  const mockUsers: any = {
    'admin@apartment.com': {
      password: 'admin123',
      role: 'ADMIN'
    },
    'user@apartment.com': {
      password: 'user123',
      role: 'USER'
    }
  };

  if (mockUsers[email] && mockUsers[email].password === password) {
    return of({
      access_token: 'mock-jwt-token-' + Date.now(),
      role: mockUsers[email].role
    }).pipe(delay(500));
  }

  return throwError(() => ({
    error: { message: 'Invalid credentials' }
  }));
}

}
