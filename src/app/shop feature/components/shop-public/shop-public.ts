import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShopService } from '../../services/shop-service';
import { FollowService } from '../../../follow feature/services/follow-service';
import { AuthService } from '../../../auth/Services/auth';
import { IShopWithProducts, IProductSummary } from '../../models/ishop-with-products';

type ActiveTab = 'products' | 'about' | 'reviews';

@Component({
  selector: 'app-shop-public',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-public.html',
  styleUrl: './shop-public.css',
})
export class ShopPublic implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);
  private followService = inject(FollowService);
  private auth = inject(AuthService);

  shop = signal<IShopWithProducts | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<ActiveTab>('products');
  isFollowing = signal(false);
  isFollowLoading = signal(false);
  shopId = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.shopId.set(id);

    this.shopService.getShopWithProducts(id).subscribe({
      next: res => {
        this.shop.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load shop');
        this.isLoading.set(false);
      }
    });

    if (this.auth.isLoggedIn()) {
      this.followService.isFollowing(id).subscribe({
        next: val => this.isFollowing.set(val)
      });
    }
  }

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }

  toggleFollow() {
    if (!this.auth.isLoggedIn()) return;
    this.isFollowLoading.set(true);
    const id = this.shopId();

    if (this.isFollowing()) {
      this.followService.unfollowShop(id).subscribe({
        next: () => { this.isFollowing.set(false); this.isFollowLoading.set(false); },
        error: () => this.isFollowLoading.set(false)
      });
    } else {
      this.followService.followShop(id).subscribe({
        next: () => { this.isFollowing.set(true); this.isFollowLoading.set(false); },
        error: () => this.isFollowLoading.set(false)
      });
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}