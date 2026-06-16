import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="insight-card-item" [ngClass]="type">
      <div class="insight-content-left">
        <span class="insight-icon-badge">
          <ng-container [ngSwitch]="type">
            <!-- success -> trend-up SVG -->
            <svg *ngSwitchCase="'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
            <!-- warning/danger -> calendar/alert SVG -->
            <svg *ngSwitchCase="'warning'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            <svg *ngSwitchCase="'danger'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            <!-- default -> bulb SVG -->
            <svg *ngSwitchDefault xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25V4.5m5.303.197-1.591 1.591m2.984 4.712H16.5M12 21.75V19.5m-5.303-.197 1.591-1.591M3.05 12h2.25M6.697 6.697l1.591-1.591m8.424 13.73-1.591-1.591" /></svg>
          </ng-container>
        </span>
        <p class="insight-text">{{ text }}</p>
      </div>
    </div>
  `,
  styles: [`
    .insight-card-item {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-radius: 14px;
      font-size: 13px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.01);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .insight-card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    }
    
    /* Elegant Gradients matching user's design image */
    .insight-card-item.info {
      background: linear-gradient(135deg, #FFF9F3 0%, #FFF0E2 100%);
      color: #8B5E3C;
      border: 1px solid rgba(212, 163, 115, 0.15);
    }
    .insight-card-item.success {
      background: linear-gradient(135deg, #F4FAF6 0%, #E8F5EE 100%);
      color: #2D6A4F;
      border: 1px solid rgba(132, 169, 140, 0.15);
    }
    .insight-card-item.warning, .insight-card-item.danger {
      background: linear-gradient(135deg, #FAF8FF 0%, #F1EDFF 100%);
      color: #5C3D99;
      border: 1px solid rgba(169, 146, 196, 0.15);
    }

    .insight-content-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 2;
      max-width: 100%;
    }
    
    .insight-icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    .insight-text {
      margin: 0;
      font-weight: 500;
      line-height: 1.4;
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class InsightCardComponent {
  @Input() text: string = '';
  @Input() type: string = 'info';

  getIcon(): string {
    if (this.type === 'success') return '📈';
    if (this.type === 'warning' || this.type === 'danger') return '📅';
    return '💡';
  }

  getIllustration(): string {
    if (this.type === 'success') return '🌿';
    if (this.type === 'warning' || this.type === 'danger') return '🗓️';
    return '📿';
  }
}
