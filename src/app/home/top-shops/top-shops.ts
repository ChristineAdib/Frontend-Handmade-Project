import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService } from '../../shop feature/services/shop-service';
import { IShop } from '../../shop feature/models/ishop';

@Component({
  selector: 'app-top-shops',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-shops.html',
  styleUrl: './top-shops.css'
})
export class TopShopsComponent implements OnInit {
  shops: IShop[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  // صور static للـ cards
  shopImages: string[] = [
    'assets/images/shop1.jpg',
    'assets/images/shop2.jpg',
    'assets/images/shop3.jpg'
  ];

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

  getShopImage(index: number): string {
    return this.shopImages[index] ?? this.shopImages[0];
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}