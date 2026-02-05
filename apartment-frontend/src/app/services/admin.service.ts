import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://localhost:5000/admin';

  constructor(private http: HttpClient) {}

  getTowers() {
    return this.http.get<any[]>(`${this.baseUrl}/towers`);
  }

  addTower(name: string) {
    return this.http.post(`${this.baseUrl}/towers`, { name });
  }

  deleteTower(id: number) {
    return this.http.delete(`${this.baseUrl}/towers/${id}`);
  }
}
