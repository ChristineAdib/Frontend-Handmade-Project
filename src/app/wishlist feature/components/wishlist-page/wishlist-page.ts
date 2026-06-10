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
  private cartApi = inject(CartApiService);

  wishlist: IWishList | null = null;
  isLoading = true;
  errorMessage = '';
  addingToCart: string | null = null; // عشان نعمل loading على الزرار

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
      next: (data) => { this.wishlist = data; },
      error: () => { this.errorMessage = 'Failed to remove item.'; },
    });
  }

  async addToCart(productId: string): Promise<void> {
    this.addingToCart = productId;
    await this.cartApi.addItem(productId, 1);
    this.addingToCart = null;
  }

  getImageUrl(item: IWishListItem): string {
    return item.imageUrl ? `${environment.apiUrl}/${item.imageUrl}` : '';
  }
}