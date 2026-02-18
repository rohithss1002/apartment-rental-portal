import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-wrapper">
      <h2>Booking Requests</h2>

      <div *ngFor="let booking of bookings" class="booking-card">

        <div>
          <strong>{{ booking.unit_number }}</strong>
          ({{ booking.bhk_type }}) - ₹{{ booking.rent }}
        </div>

        <div>
          {{ booking.user_name }} ({{ booking.user_email }})
        </div>

        <div>Status: {{ booking.status }}</div>

        <div *ngIf="booking.status === 'PENDING'">
          <button (click)="update(booking.id, 'APPROVED')" class="approve">
            Approve
          </button>
          <button (click)="update(booking.id, 'DECLINED')" class="decline">
            Decline
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper { padding: 40px; }
    .booking-card {
      background: #fff;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .approve {
      background: green;
      color: white;
      padding: 6px 12px;
      margin-right: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .decline {
      background: red;
      color: white;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class Admin implements OnInit {

  bookings: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAllBookings().subscribe(data => this.bookings = data);
  }

  update(id: number, status: string) {
    this.api.updateBooking(id, status).subscribe(() => {
      this.load();
    });
  }
}
