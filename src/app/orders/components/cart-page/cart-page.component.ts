import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CartApiService, CartItemDto } from '../../services/cart-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { WishlistService } from '../../../wishlist feature/services/wishlist-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent implements OnInit {
  readonly cartApi = inject(CartApiService);
  protected readonly langService = inject(LanguageService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.cartApi.getCart();
  }

  addToWishlist(item: CartItemDto): void {
    this.wishlistService.addItem(item.productId).subscribe({
      next: () => {
        const msg = this.langService.currentLang() === 'ar'
          ? 'تمت إضافة المنتج إلى قائمة الأمنيات!'
          : 'Added to wishlist successfully!';
        this.toastr.success(msg);
      },
      error: (err) => {
        const msg = this.langService.currentLang() === 'ar'
          ? 'فشل إضافة المنتج لقائمة الأمنيات.'
          : 'Failed to add item to wishlist.';
        this.toastr.error(msg);
        console.error(err);
      }
    });
  }



  async increment(item: CartItemDto): Promise<void> {
    if (item.isSoldOut || item.quantity >= item.stockQuantity || this.cartApi.isLoading()) {
      return;
    }
    await this.cartApi.updateQuantity(item.productId, item.quantity + 1);
  }

  async decrement(item: CartItemDto): Promise<void> {
    if (item.isSoldOut || item.quantity <= 1 || this.cartApi.isLoading()) {
      return;
    }
    await this.cartApi.updateQuantity(item.productId, item.quantity - 1);
  }

  async removeItem(productId: string): Promise<void> {
    await this.cartApi.removeItem(productId);
  }

  hasSoldOutItems(): boolean {
    const cart = this.cartApi.cart();
    if (!cart || !cart.items) return false;
    return cart.items.some(item => item.isSoldOut);
  }

  getImageUrl(item: CartItemDto): string {
    if (!item.imageUrl) return '';
    if (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://') || item.imageUrl.startsWith('//')) {
      return item.imageUrl;
    }
    return `${environment.apiUrl}/${item.imageUrl}`;
  }
}
