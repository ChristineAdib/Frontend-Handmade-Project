import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../services/shop-service';
import { IShop } from '../../models/ishop';
import { LanguageService } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop-list.html',
  styleUrl: './shop-list.css'
})
export class ShopListComponent implements OnInit {
  private readonly shopService = inject(ShopService);
  protected readonly langService = inject(LanguageService);

  shops = signal<IShop[]>([]);
  filteredShops = signal<IShop[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.isLoading.set(true);
    this.error.set(null);

    // Call searchShops with empty filter to get all shops
    this.shopService.searchShops({}).subscribe({
      next: (res) => {
        this.shops.set(res);
        this.filteredShops.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load shops', err);
        this.error.set('Failed to load artisans.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredShops.set(this.shops());
      return;
    }

    const filtered = this.shops().filter(shop => 
      shop.name.toLowerCase().includes(query) || 
      (shop.descriptionEn && shop.descriptionEn.toLowerCase().includes(query)) ||
      (shop.descriptionAr && shop.descriptionAr.toLowerCase().includes(query))
    );
    this.filteredShops.set(filtered);
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
