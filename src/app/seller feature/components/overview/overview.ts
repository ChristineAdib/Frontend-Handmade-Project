import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../shop feature/services/shop-service';
import { IShop } from '../../../shop feature/models/ishop';
import { IShopStats } from '../../../shop feature/models/ishop-stats';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  private shopService = inject(ShopService);

  shop = signal<IShop | null>(null);
  stats = signal<IShopStats | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: res => {
        this.shop.set(res);
        this.shopService.getMyShopStats().subscribe({
          next: s => {
            this.stats.set(s);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: err => {
        this.error.set('Failed to load shop data');
        this.isLoading.set(false);
      }
    });
  }
}