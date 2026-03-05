import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of, delay, catchError } from 'rxjs';

export interface UnitSearchParams {
  q?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  tower?: string;
  page?: number;
  limit?: number;
}

export interface UnitSearchResponse {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  count: number;
  data: any[];
}

export interface FilterMeta {
  towers: string[];
  statuses: string[];
  bhk_types: string[];
  price_range: { min: number; max: number };
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = 'https://apartment-api-682540295123.asia-south1.run.app';

  constructor(private http: HttpClient) {}

  // ---------------- AUTH ----------------

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password });
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

  // ---------------- UNITS (original, kept for compatibility) ----------------

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

  // ---------------- SEARCH + FILTER (NEW) ----------------

  /**
   * Public endpoint — no token required.
   * Supports: q, min_price, max_price, status, tower, page, limit
   */
  searchUnits(filters: UnitSearchParams = {}) {
    let params = new HttpParams();

    if (filters.q)         params = params.set('q', filters.q);
    if (filters.min_price != null) params = params.set('min_price', filters.min_price.toString());
    if (filters.max_price != null) params = params.set('max_price', filters.max_price.toString());
    if (filters.status)    params = params.set('status', filters.status);
    if (filters.tower)     params = params.set('tower', filters.tower);
    if (filters.page)      params = params.set('page', filters.page.toString());
    if (filters.limit)     params = params.set('limit', filters.limit.toString());

    return this.http.get<UnitSearchResponse>(`${this.baseUrl}/units/search`, { params });
  }

  /**
   * Returns towers, statuses, BHK types, and price range
   * for building filter dropdowns dynamically.
   */
  getFilterMeta() {
    return this.http.get<FilterMeta>(`${this.baseUrl}/units/filter-meta`);
  }

  // ---------------- ADMIN ----------------

  getAllBookings() {
    return this.http.get<any[]>(`${this.baseUrl}/admin/bookings`);
  }

  updateBooking(id: number, status: string) {
    return this.http.put(`${this.baseUrl}/admin/bookings/${id}`, { status });
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
      catchError(() => of({
        towers: 4, units: 124, flats: 312,
        tenants: 256, bookingsPending: 7, occupancyRate: 82
      }).pipe(delay(300)))
    );
  }

  getOccupancyTrend() {
    return this.http.get<any>(`${this.baseUrl}/dashboard/occupancy`).pipe(
      catchError(() => of([
        { month: 'Aug', occupancy: 75 }, { month: 'Sep', occupancy: 78 },
        { month: 'Oct', occupancy: 80 }, { month: 'Nov', occupancy: 79 },
        { month: 'Dec', occupancy: 81 }, { month: 'Jan', occupancy: 82 }
      ]).pipe(delay(200)))
    );
  }

  getAdminBookings() {
  return this.http.get<any>(
    `${this.baseUrl}/admin/bookings`,
    { headers: this.getAuthHeaders() }
  );
}

updateBookingStatus(id: number, status: string) {
  return this.http.put(
    `${this.baseUrl}/admin/bookings/${id}`,
    { status },
    { headers: this.getAuthHeaders() }
  );
}

  getRecentActivity() {
    return this.http.get<any>(`${this.baseUrl}/dashboard/activity`).pipe(
      catchError(() => of([
        { type: 'booking', title: 'New booking request — Flat A-102', user: 'alice@test.com', time: '2 hours ago' },
        { type: 'payment', title: 'Payment received — Unit 3B', user: 'bob@test.com', time: '6 hours ago' },
        { type: 'tenant', title: 'Tenant moved in — Flat C-201', user: 'charlie@test.com', time: '1 day ago' },
        { type: 'admin', title: 'Tower settings updated', user: 'admin@test.com', time: '2 days ago' }
      ]).pipe(delay(250)))
    );
  }
}