import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="details-wrapper" *ngIf="unit">

      <button class="back-btn" (click)="goBack()">← Back</button>

      <div class="details-card">
        <img *ngIf="unit.image_url"
             [src]="unit.image_url"
             class="details-image" />

        <div class="details-info">
          <h2>{{ unit.unit_number }} - {{ unit.bhk_type }}</h2>
          <p><strong>Tower:</strong> {{ unit.tower_name }}</p>
          <p><strong>Rent:</strong> ₹{{ unit.rent }} / month</p>
          <p><strong>Status:</strong> {{ unit.status }}</p>

          <button
            (click)="book(unit.id)"
            [disabled]="unit.status !== 'AVAILABLE'"
            class="book-btn">
            {{ unit.status === 'AVAILABLE' ? 'Book Now' : 'Not Available' }}
          </button>

          <div *ngIf="message" class="success-msg">
            {{ message }}
          </div>
        </div>

        <div class="amenities" *ngIf="unit.amenities?.length">
  <h3>Amenities</h3>
  <div class="amenity-list">
    <span class="amenity-badge"
          *ngFor="let amenity of unit.amenities">
      {{ amenity }}
    </span>
  </div>
</div>

      </div>
    </div>
  `,
  styles: [`
    .details-wrapper {
      padding: 40px;
      font-family: Inter, system-ui;
    }

    .back-btn {
      margin-bottom: 20px;
      border: none;
      background: none;
      font-size: 16px;
      cursor: pointer;
      color: #2563eb;
    }

    .details-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }

    .details-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 12px;
    }

    .details-info h2 {
      margin-bottom: 16px;
    }

    .book-btn {
      margin-top: 20px;
      padding: 12px;
      width: 100%;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg,#667eea,#764ba2);
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .book-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .success-msg {
      margin-top: 12px;
      padding: 10px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 6px;
    }

    .amenities {
  margin-top: 20px;
}

.amenity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.amenity-badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

    @media (max-width: 768px) {
      .details-card {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UnitDetails implements OnInit {

  unit: any;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  this.api.getUnitDetails(id).subscribe({
    next: (data) => {
      this.unit = data;
    }
  });
}


  book(unitId: number) {
    this.api.bookUnit(unitId).subscribe({
      next: () => {
        this.message = "Booking request submitted!";
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
