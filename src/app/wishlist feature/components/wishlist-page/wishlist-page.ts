import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist-service';
import { environment } from '../../../../environments/environment';
import { IWishList } from '../../models/iwish-list';
import { IWishListItem } from '../../models/iwish-list-item';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
   templateUrl: './wishlist-page.html',  
  styleUrl: './wishlist-page.css', 
})
export class WishlistPageComponent implements OnInit {
  private wishlistService = inject(WishlistService);

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
      },
      error: () => {
        this.errorMessage = 'Failed to remove item.';
      },
    });
  }

  getImageUrl(item: IWishListItem): string {
    return item.imageUrl ? `${environment.apiUrl}/${item.imageUrl}` : '';
  }
}