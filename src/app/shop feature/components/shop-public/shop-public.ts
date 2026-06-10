import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ShopService } from '../../services/shop-service';
import { FollowService } from '../../../follow feature/services/follow-service';
import { AuthService } from '../../../auth/Services/auth';
import { CartApiService } from '../../../orders/services/cart-api.service';
import { IShopWithProducts, IProductSummary } from '../../models/ishop-with-products';
import { LanguageService } from '../../../core/services/language.service';

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
  private cartApi = inject(CartApiService);
  private toastr = inject(ToastrService);
  protected langService = inject(LanguageService);

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
        this.error.set(this.langService.translate('failedToLoadShop'));
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

  quickAdd(productId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.toastr.warning(
        this.langService.currentLang() === 'ar'
          ? 'الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.'
          : 'Please log in first to add items to your cart.'
      );
      return;
    }

    this.cartApi.addItem(productId, 1).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة!'
            : 'Product added to cart!'
        );
      } else {
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'فشل إضافة المنتج إلى السلة.'
            : 'Failed to add item to cart.'
        );
      }
    }).catch(err => {
      console.error('Quick add error:', err);
      this.toastr.error('Failed to add item to cart.');
    });
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}