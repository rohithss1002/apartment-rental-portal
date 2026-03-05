import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService, FilterMeta, UnitSearchParams } from '../services/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './units.html',
  styleUrls: ['./units.css']
})
export class Units implements OnInit, OnDestroy {

  // ---- State ----
  units: Unit[] = [];
  loading = false;
  error = '';

  // ---- Filter state ----
  searchQuery = '';
  selectedTower = '';
  selectedStatus = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  filtersOpen = false;

  // ---- Filter metadata (from API) ----
  meta: FilterMeta = { towers: [], statuses: [], bhk_types: [], price_range: { min: 0, max: 0 } };

  // ---- Pagination ----
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  pageLimit = 12;

  // ---- Debounce ----
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // ---- Auth ----
  isLoggedIn = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('access_token');

    // Load filter metadata
    this.api.getFilterMeta().subscribe({
      next: (meta) => { this.meta = meta; },
      error: () => {}
    });

    // Debounce search input — wait 350ms after last keystroke
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUnits();
    });

    // Initial load
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- Load units with current filters ----
  loadUnits(): void {
    this.loading = true;
    this.error = '';

    const filters: UnitSearchParams = {
      page: this.currentPage,
      limit: this.pageLimit
    };

    if (this.searchQuery.trim()) filters.q = this.searchQuery.trim();
    if (this.selectedTower)      filters.tower = this.selectedTower;
    if (this.selectedStatus)     filters.status = this.selectedStatus;
    if (this.minPrice != null)   filters.min_price = this.minPrice;
    if (this.maxPrice != null)   filters.max_price = this.maxPrice;

    this.api.searchUnits(filters).subscribe({
      next: (res) => {
        this.units = res.data;
        this.totalPages = res.total_pages;
        this.totalRecords = res.total_records;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading units:', err);
        this.error = 'Failed to load units. Please try again.';
        this.loading = false;
      }
    });
  }

  // ---- Trigger debounced search ----
  onSearchInput(): void {
    this.searchSubject.next();
  }

  // ---- Trigger immediate filter (dropdowns) ----
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUnits();
  }

  // ---- Clear all filters ----
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedTower = '';
    this.selectedStatus = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 1;
    this.loadUnits();
  }

  // ---- Check if any filter is active ----
  get hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.selectedTower ||
      this.selectedStatus ||
      this.minPrice != null ||
      this.maxPrice != null
    );
  }

  // ---- Pagination ----
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUnits();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ---- Book ----
  book(unitId: number): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.bookUnit(unitId).subscribe({
      next: () => alert('Booking request sent!'),
      error: (err: HttpErrorResponse) => {
        console.error('Booking failed:', err);
        alert('Booking failed. Please try again.');
      }
    });
  }
}