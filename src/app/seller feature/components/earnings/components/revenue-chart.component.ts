import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-container">
      <div *ngIf="isLoading; else chartBlock" class="chart-skeleton"></div>
      
      <ng-template #chartBlock>
        <div *ngIf="!hasData; else realChart" class="hand-drawn-empty-state animate-fade-in">
          <div class="empty-state-sketch">✨🎨🛍️</div>
          <h4 class="empty-state-title">{{ emptyStateTitle }}</h4>
          <p class="empty-state-text">{{ emptyStateText }}</p>
          <div class="empty-state-decorations">
            <span class="decor-sparkle">✦</span>
            <span class="decor-sparkle">✿</span>
            <span class="decor-sparkle">✦</span>
          </div>
        </div>
        
        <ng-template #realChart>
          <apx-chart
            *ngIf="chartOptions"
            [series]="chartOptions.series!"
            [chart]="chartOptions.chart!"
            [xaxis]="chartOptions.xaxis!"
            [yaxis]="chartOptions.yaxis!"
            [colors]="chartOptions.colors!"
            [stroke]="chartOptions.stroke!"
            [fill]="chartOptions.fill!"
            [dataLabels]="chartOptions.dataLabels!"
            [grid]="chartOptions.grid!"
            [tooltip]="chartOptions.tooltip!"
            [theme]="chartOptions.theme!"
          ></apx-chart>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      min-height: 250px;
    }
    .chart-skeleton {
      width: 100%;
      height: 380px;
      border-radius: 8px;
      background: linear-gradient(90deg, var(--skeleton-bg, #e9e3d9) 25%, var(--skeleton-shimmer, #f3ede2) 50%, var(--skeleton-bg, #e9e3d9) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .hand-drawn-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      background: transparent;
    }
    .empty-state-sketch {
      font-size: 56px;
      margin-bottom: 1rem;
      animation: floatSketch 4s ease-in-out infinite;
    }
    @keyframes floatSketch {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .empty-state-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #3D2B1F);
      margin: 0 0 0.5rem 0;
    }
    .empty-state-text {
      font-size: 13px;
      color: var(--text-secondary, #705342);
      line-height: 1.4;
      max-width: 320px;
      margin: 0 auto 1rem auto;
    }
    .empty-state-decorations {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .decor-sparkle {
      font-size: 12px;
      color: var(--brand-accent, #d4a373);
      opacity: 0.8;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class RevenueChartComponent {
  @Input() chartOptions: any;
  @Input() isLoading: boolean = false;
  @Input() hasData: boolean = true;
  @Input() emptyStateTitle: string = '';
  @Input() emptyStateText: string = '';
}
