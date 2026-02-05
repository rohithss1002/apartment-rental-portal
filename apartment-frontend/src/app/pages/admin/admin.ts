import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {

  overview: any;
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAdminOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load admin data';
        this.loading = false;
      }
    });
  }
}
