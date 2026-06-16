import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistic-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <span class="stat-card-label">{{ label }}</span>
      <span class="stat-card-value">{{ value }}</span>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #ffffff;
      border: 1px solid #E5E1DC;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100px;
      height: 100%;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(139, 69, 19, 0.05);
      border-color: #d4c3b8;
    }
    .stat-card-label {
      font-size: 13px;
      color: #8a786d;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .stat-card-value {
      font-size: 20px;
      font-weight: 700;
      color: #2c1810;
      font-family: 'Plus Jakarta Sans', sans-serif;
      word-break: break-word;
    }
  `]
})
export class StatisticCard {
  @Input() label: string = '';
  @Input() value: string | number = '';
}
