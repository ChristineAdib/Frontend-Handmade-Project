import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService } from '../../shop feature/services/shop-service';
import { IShop } from '../../shop feature/models/ishop';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-top-shops',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-shops.html',
  styleUrl: './top-shops.css'
})
export class TopShopsComponent implements OnInit {
  protected readonly langService = inject(LanguageService);
  shops: IShop[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.isLoading = true;
    this.shopService.getTopRatedShops(3).subscribe({
      next: (res) => {
        this.shops = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load shops.';
        this.isLoading = false;
      }
    });
  }

  getShopLogo(shop: IShop): string {
    if (!shop.logo) {
      return 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(shop.name);
    }
    if (shop.logo.startsWith('http://') || shop.logo.startsWith('https://') || shop.logo.startsWith('//')) {
      return shop.logo;
    }
    return `${environment.apiUrl}/${shop.logo}`;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}