import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="dashboard p-6">
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
    </main>
  `,
  styles: [`
    .dashboard { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    h2 { font-size: 1.5rem; margin-bottom: 12px; }
    .top { display:flex; align-items:center; justify-content:space-between; }
    .stats { display:flex; gap:12px; }
    .stat-card { background:#fff; padding:12px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(2,6,23,0.06); min-width:120px; }
    .stat-card .label { font-size:12px; color:#6b7280 }
    .stat-card .num { font-size:1.25rem; font-weight:700 }

    .content-grid { display:grid; grid-template-columns: 2fr 1fr; gap:16px; margin-top:16px }
    .card { background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 6px rgba(2,6,23,0.06); }
    .chart { display:flex; flex-direction:column; gap:8px }
    .trend-svg { width:100%; height:160px; display:block }
    .months { display:flex; justify-content:space-between; font-size:12px; color:#374151 }

    .activity ul { list-style:none; padding:0; margin:0 }
    .activity li { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f3f4f6 }
    .act-type { font-size:11px; color:#9ca3af; text-transform:uppercase }
    .act-title { font-weight:600 }
    .act-user { font-size:12px; color:#6b7280 }
    .act-time { font-size:11px; color:#9ca3af }
  `]
})
export class Dashboard implements OnInit {
  stats: any = {};
  trend: Array<{month:string, occupancy:number}> = [];
  activities: any[] = [];

  // svg helpers
  svgView = '0 0 100 40';
  trendPath = '';
  svgPoints: Array<{x:number,y:number}> = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe({ next: (res) => this.stats = res, error: (err)=> console.error(err) });
    this.api.getOccupancyTrend().subscribe({ next: (t) => { this.trend = t; this.buildSvg(); }, error: (e)=> console.error(e) });
    this.api.getRecentActivity().subscribe({ next: (a) => this.activities = a, error: (e)=> console.error(e) });
  }

  buildSvg() {
    if (!this.trend || this.trend.length === 0) return;

    const w = 100; const h = 40; const padding = 6;
    const values = this.trend.map(s => s.occupancy);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const xStep = w / Math.max(1, this.trend.length - 1);

    const points = this.trend.map((s, i) => {
      const x = i * xStep;
      // normalize y (invert because svg y starts at top)
      const y = h - padding - ((s.occupancy - min) / Math.max(1, max - min)) * (h - padding * 2);
      return { x, y };
    });

    this.svgPoints = points.map(p => ({ x: (p.x), y: (p.y) }));

    // build path
    this.trendPath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }
}

