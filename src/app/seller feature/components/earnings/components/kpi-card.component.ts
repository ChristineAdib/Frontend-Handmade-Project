import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="kpi-card">
      <div *ngIf="isLoading; else contentBlock" class="kpi-skeleton">
        <div class="sk-circle"></div>
        <div class="sk-line long"></div>
        <div class="sk-line short"></div>
      </div>
      
      <ng-template #contentBlock>
        <div class="kpi-header-row">
          <span class="kpi-label">{{ label }}</span>
          <div class="kpi-icon" [ngClass]="iconBgClass || 'default-bg'">
            <ng-container [ngSwitch]="icon">
              <!-- Revenue Wallet SVG -->
              <svg *ngSwitchCase="'revenue'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" /></svg>
              <!-- Orders Bag SVG -->
              <svg *ngSwitchCase="'orders'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              <!-- Customers Users SVG -->
              <svg *ngSwitchCase="'customers'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21.25c-1.061 0-2.085-.138-3.06-.399v-.109c0-1.112.284-2.16.786-3.07M15 19.128v-.003c.843-.058 1.688-.202 2.505-.431m-8.63 3.51a9.378 9.378 0 0 1-2.625.372 9.337 9.337 0 0 1-4.121-.952 4.125 4.125 0 0 1 7.533-2.493M9 19.128v-.003c-.843-.058-1.688-.202-2.505-.431m0 0a10.92 10.92 0 0 1-1.242-2.884m12.38 2.884a10.92 10.92 0 0 0 1.242-2.884M9 19.128v-.071c0-1.127.224-2.2.629-3.196m0 0A10.954 10.954 0 0 1 12 15c1.098 0 2.13.325 3.003.882m-6.005 0c-.08-.433-.123-.879-.123-1.332 0-2.346 1.897-4.25 4.238-4.25 2.342 0 4.238 1.904 4.238 4.25 0 .453-.043.899-.123 1.332m-9.303 0h9.429M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.304 1.125a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0ZM3.75 8.625a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" /></svg>
              <!-- Rating Star SVG -->
              <svg *ngSwitchCase="'rating'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.195-.558.972-.558 1.168 0l2.036 5.823a.75.75 0 0 0 .707.507h6.168c.594 0 .84.776.36 1.181l-4.992 4.243a.75.75 0 0 0-.258.788l1.004 6.168c.097.594-.523 1.045-1.026.764l-5.32-2.793a.75.75 0 0 0-.711 0l-5.32 2.793c-.503.281-1.123-.17-1.026-.764l1.004-6.168a.75.75 0 0 0-.258-.788l-4.992-4.243c-.48-.405-.234-1.181.36-1.181h6.168a.75.75 0 0 0 .707-.507l2.036-5.823Z" /></svg>
              <!-- Fallback -->
              <span *ngSwitchDefault>{{ icon }}</span>
            </ng-container>
          </div>
        </div>
        <div class="kpi-value-row">
          <div class="kpi-val-container">
            <h2 class="kpi-value">{{ value }}</h2>
            
            <span *ngIf="trendValue !== undefined && trendValue !== null" 
                  class="kpi-trend" 
                  [class.up]="trendValue >= 0" 
                  [class.down]="trendValue < 0">
              <svg *ngIf="trendValue >= 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px; display: inline-block; vertical-align: middle; margin-top: -2px;"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" /></svg>
              <svg *ngIf="trendValue < 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 10px; height: 10px; display: inline-block; vertical-align: middle; margin-top: -2px;"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25" /></svg>
              {{ Math.abs(trendValue) }}% {{ trendLabel }}
            </span>
            
            <span *ngIf="subtext && (trendValue === undefined || trendValue === null)" class="kpi-subtext">
              {{ subtext }}
            </span>
          </div>
        </div>
        
        <!-- Mini Sparkline Spark Chart -->
        <div class="kpi-sparkline" *ngIf="sparklineData && sparklineData.length > 0 && sparklineOptions">
          <apx-chart
            [series]="sparklineOptions.series"
            [chart]="sparklineOptions.chart"
            [stroke]="sparklineOptions.stroke"
            [colors]="sparklineOptions.colors"
            [tooltip]="sparklineOptions.tooltip"
          ></apx-chart>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: var(--card-bg, #ffffff);
      padding: 1.25rem;
      border-radius: 16px;
      border: 1px solid var(--card-border, rgba(61, 43, 31, 0.05));
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.015);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-height: 160px;
    }
    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(61, 43, 31, 0.06);
    }
    .kpi-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .kpi-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary, #705342);
      font-family: 'Inter', sans-serif;
    }
    .kpi-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon svg {
      width: 16px;
      height: 16px;
      stroke-width: 2px;
    }
    .default-bg { background: rgba(212, 163, 115, 0.15); color: #c18b52; }
    .revenue-bg { background: rgba(212, 163, 115, 0.12); color: #c18b52; }
    .orders-bg { background: rgba(229, 141, 145, 0.12); color: #e58d91; }
    .customers-bg { background: rgba(132, 169, 140, 0.12); color: #84a98c; }
    .rating-bg { background: rgba(169, 146, 196, 0.12); color: #a992c4; }

    .kpi-value-row {
      display: flex;
      flex-direction: column;
      margin-top: 0.75rem;
      width: 100%;
    }
    .kpi-val-container {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      font-family: 'Playfair Display', serif;
      color: var(--text-primary, #3D2B1F);
    }
    .kpi-trend {
      font-size: 11px;
      font-weight: 600;
      width: max-content;
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 2px;
    }
    .kpi-trend.up {
      color: var(--trend-up, #2d6a4f);
    }
    .kpi-trend.down {
      color: var(--trend-down, #b7094c);
    }
    .kpi-subtext {
      font-size: 11px;
      color: var(--text-secondary, #705342);
      margin-top: 2px;
    }
    .kpi-sparkline {
      width: 100%;
      height: 40px;
      margin-top: 0.5rem;
    }
    
    /* skeleton loaders */
    .kpi-skeleton {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .sk-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--skeleton-bg, #e9e3d9);
    }
    .sk-line {
      height: 10px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--skeleton-bg, #e9e3d9) 25%, var(--skeleton-shimmer, #f3ede2) 50%, var(--skeleton-bg, #e9e3d9) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .sk-line.long { width: 80%; }
    .sk-line.short { width: 50%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class KpiCardComponent implements OnChanges {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() trendValue?: number;
  @Input() trendLabel?: string;
  @Input() icon?: string;
  @Input() iconBgClass?: string;
  @Input() subtext?: string;
  @Input() isLoading: boolean = false;
  @Input() sparklineData?: number[];
  @Input() sparklineColor?: string;

  sparklineOptions: any;
  protected readonly Math = Math;

  ngOnChanges() {
    if (this.sparklineData && this.sparklineData.length > 0) {
      this.sparklineOptions = {
        series: [{
          name: this.label,
          data: this.sparklineData
        }],
        chart: {
          type: 'area',
          height: 40,
          sparkline: {
            enabled: true
          },
          animations: {
            enabled: true,
            speed: 500
          }
        },
        stroke: {
          curve: 'smooth',
          width: 1.5
        },
        colors: [this.sparklineColor || '#d4a373'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.25,
            opacityTo: 0.02,
            stops: [0, 90, 100]
          }
        },
        tooltip: {
          enabled: false
        }
      };
    }
  }
}
