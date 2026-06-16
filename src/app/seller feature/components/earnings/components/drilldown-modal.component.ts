import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drilldown-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay -->
    <div class="drilldown-drawer-overlay" [class.active]="isOpen" (click)="closeModal()"></div>

    <!-- Side Drawer -->
    <div class="drilldown-drawer" [class.active]="isOpen">
      <div class="drawer-header">
        <h3 class="drawer-title">{{ arabic ? 'تفاصيل مبيعات اليوم' : 'Daily Sales Drill-down' }}</h3>
        <button class="close-drawer-btn" (click)="closeModal()">&times;</button>
      </div>

      <div *ngIf="isLoading; else dataContent" class="drawer-loading">
        <div class="drawer-spinner"></div>
        <p>{{ arabic ? 'جاري قراءة تفاصيل اليوم من السجلات...' : 'Reading daily logs from registry...' }}</p>
      </div>

      <ng-template #dataContent>
        <div *ngIf="error; else realData" class="drawer-error">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
        </div>
        
        <ng-template #realData>
          <div *ngIf="data" class="drawer-body animate-fade-in">
            <div class="selected-date-badge">
              📅 {{ dateStr }}
            </div>

            <div class="drawer-kpi-row">
              <div class="drawer-kpi-card">
                <span class="drawer-kpi-label">{{ arabic ? 'أرباح اليوم' : 'Daily Revenue' }}</span>
                <h4 class="drawer-kpi-value">EGP {{ data.revenue | number:'1.2-2' }}</h4>
              </div>
              <div class="drawer-kpi-card">
                <span class="drawer-kpi-label">{{ arabic ? 'الطلبات المكتملة' : 'Orders Count' }}</span>
                <h4 class="drawer-kpi-value">{{ data.ordersCount }}</h4>
              </div>
            </div>

            <div class="drawer-section">
              <h4 class="drawer-section-title">{{ arabic ? 'المنتجات التي بيعت اليوم' : 'Creations Sold Today' }}</h4>
              <div *ngIf="!data.productsSold || data.productsSold.length === 0; else productsBlock" class="drawer-no-products">
                {{ arabic ? 'لم يتم تسجيل سلع مباعة اليوم.' : 'No items sold on this day.' }}
              </div>
              
              <ng-template #productsBlock>
                <div class="drawer-products-list">
                  <div *ngFor="let pName of data.productsSold" class="drawer-product-item">
                    <span class="drawer-product-dot"></span>
                    <span>{{ pName }}</span>
                  </div>
                </div>
              </ng-template>
            </div>
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: [`
    /* ── DRILL-DOWN SIDE DRAWER (GLASSMORPHISM) ── */
    .drilldown-drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .drilldown-drawer-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .drilldown-drawer {
      position: fixed;
      top: 0;
      right: -450px;
      width: 100%;
      max-width: 420px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-left: 1px solid rgba(61, 43, 31, 0.08);
      box-shadow: -10px 0 30px rgba(61, 43, 31, 0.08);
      z-index: 1001;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      color: #3D2B1F;
    }

    :host-context([dir="rtl"]) .drilldown-drawer {
      right: auto;
      left: -450px;
      border-left: none;
      border-right: 1px solid rgba(61, 43, 31, 0.08);
    }

    .drilldown-drawer.active {
      transform: translateX(-450px);
    }

    :host-context([dir="rtl"]) .drilldown-drawer.active {
      transform: translateX(450px);
    }

    @media (max-width: 480px) {
      .drilldown-drawer {
        max-width: 100%;
        right: -100%;
      }
      .drilldown-drawer.active {
        transform: translateX(-100%);
      }
      :host-context([dir="rtl"]) .drilldown-drawer {
        left: -100%;
      }
      :host-context([dir="rtl"]) .drilldown-drawer.active {
        transform: translateX(100%);
      }
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(61, 43, 31, 0.08);
      padding-bottom: 1rem;
    }

    .drawer-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .close-drawer-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #705342;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: color 0.2s;
    }

    .close-drawer-btn:hover {
      color: #d4a373;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .selected-date-badge {
      background: #F5F0E8;
      border: 1px solid rgba(61, 43, 31, 0.08);
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .drawer-kpi-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .drawer-kpi-card {
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(61, 43, 31, 0.05);
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(61, 43, 31, 0.05);
    }

    .drawer-kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #705342;
      margin-bottom: 0.25rem;
      display: block;
    }

    .drawer-kpi-value {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }

    .drawer-section {
      margin-top: 1.5rem;
    }

    .drawer-section-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      color: #705342;
      border-bottom: 1px dashed rgba(61, 43, 31, 0.08);
      padding-bottom: 4px;
    }

    .drawer-products-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .drawer-product-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(61, 43, 31, 0.05);
      font-size: 13px;
      font-weight: 500;
    }

    .drawer-product-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d4a373;
    }

    .drawer-no-products {
      font-size: 13px;
      color: #705342;
      font-style: italic;
    }

    .drawer-loading, .drawer-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }

    .drawer-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e9e3d9;
      border-top: 3px solid #d4a373;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .error-icon {
      font-size: 32px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DrilldownModalComponent {
  @Input() isOpen: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() data: any = null;
  @Input() dateStr: string = '';
  @Input() arabic: boolean = false;

  @Output() onClose = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit();
  }
}
