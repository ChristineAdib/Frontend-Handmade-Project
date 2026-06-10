import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { WishlistService } from '../../services/wishlist-service';
import { CartApiService } from '../../../orders/services/cart-api.service';
import { environment } from '../../../../environments/environment';
import { IWishList } from '../../models/iwish-list';
import { IWishListItem } from '../../models/iwish-list-item';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist-page.html',  
  styleUrl: './wishlist-page.css', 
})
export class WishlistPageComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private cartApiService = inject(CartApiService);
  private toastr = inject(ToastrService);
  public langService = inject(LanguageService);

  wishlist: IWishList | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadWishList();
  }

  loadWishList(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.wishlistService.getWishList().subscribe({
      next: (data) => {
        this.wishlist = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load wishlist.';
        this.isLoading = false;
      },
    });
  }

  removeItem(productId: string): void {
    this.wishlistService.removeItem(productId).subscribe({
      next: (data) => {
        this.wishlist = data;
        this.toastr.success(
          this.langService.currentLang() === 'ar' ? 'تمت الإزالة من قائمة الأمنيات' : 'Removed from wishlist'
        );
      },
      error: () => {
        this.errorMessage = 'Failed to remove item.';
      },
    });
  }

  addToCart(productId: string): void {
    this.cartApiService.addItem(productId, 1).then((res) => {
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
      console.error('Add to cart from wishlist error:', err);
      this.toastr.error('Failed to add item to cart.');
    });
  }

  getImageUrl(item: IWishListItem): string {
    return item.imageUrl ? `${environment.apiUrl}/${item.imageUrl}` : '';
  }
}