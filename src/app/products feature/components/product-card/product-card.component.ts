import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Product } from '../../models/product.model';
import { LanguageService } from '../../../core/services/language.service';
import { AppHoverCard } from '../../../core/directives/app-hover-card';
import { ProductCard as ProductCardDirective } from '../../../core/directives/product-card';

import { WishlistService } from '../../../wishlist feature/services/wishlist-service';
import { CartApiService } from '../../../orders/services/cart-api.service';
import { AuthService } from '../../../auth/Services/auth';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHoverCard, ProductCardDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  public langService = inject(LanguageService);
  private wishlistService = inject(WishlistService);
  private cartApiService = inject(CartApiService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @Input() product!: Product;
  @Output() quickView = new EventEmitter<Product>();

  onQuickView(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/products', this.product.id]);
    this.quickView.emit(this.product);
  }

  onAddToWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.addItem(this.product.id).subscribe({
      next: () => {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى قائمة الأمنيات!'
            : 'Product added to wishlist!'
        );
      },
      error: (err) => {
        let errMsg = this.langService.currentLang() === 'ar'
          ? 'فشل إضافة المنتج لقائمة الأمنيات.'
          : 'Failed to add item to wishlist.';
        if (err?.error) {
          if (typeof err.error === 'object' && err.error.message) errMsg = err.error.message;
          else if (Array.isArray(err.error) && err.error.length > 0) errMsg = err.error[0];
          else if (typeof err.error === 'string') errMsg = err.error;
        }
        this.toastr.error(errMsg, '', { timeOut: 10000 });
      }
    });
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartApiService.addItem(this.product.id, 1).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة!'
            : 'Product added to cart!'
        );
      } else {
        const errMsg = this.cartApiService.error() || (
          this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.'
        );
        this.toastr.error(errMsg, '', { timeOut: 10000 });
      }
    }).catch(() => {
      this.toastr.error(
        this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.',
        '', { timeOut: 10000 }
      );
    });
  }

  hasDiscount(): boolean {
    return !!this.product.discountPrice && this.product.discountPrice < this.product.price;
  }

  getStarsArray(): number[] {
    return Array(Math.round(this.product.averageRating)).fill(0);
  }

  getEmptyStarsArray(): number[] {
    return Array(Math.max(0, 5 - Math.round(this.product.averageRating))).fill(0);
  }
}