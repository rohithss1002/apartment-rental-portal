import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';
import { HttpErrorResponse } from '@angular/common/http';

export interface Unit {
  id: number;
  unit_number: string;
  bhk_type: string;
  rent: number;
  status: string;
  image_url: string;
  tower_name: string;
}

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './units.html',
  styleUrls: ['./units.css']
})
export class Units implements OnInit {

  units: Unit[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getUnits().subscribe({
      next: (data: Unit[]) => {
        this.units = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading units:', err);
      }
    });
  }

  book(unitId: number): void {
    this.api.bookUnit(unitId).subscribe({
      next: () => {
        alert('Booking request sent!');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Booking failed:', err);
        alert('Booking failed');
      }
    });
  }
}
