import { Injectable, inject } from '@angular/core';
import { ProductsService } from '../../products feature/services/products-service';
import { firstValueFrom } from 'rxjs';
import { IWishList } from '../models/iwish-list';
import { IWishListItem } from '../models/iwish-list-item';

@Injectable({ providedIn: 'root' })
export class GuestWishlistService {
  private readonly productsService = inject(ProductsService);
  private readonly storageKey = 'guest_wishlist';
  private inMemoryWishlist: IWishList = { id: 'guest', userId: 'guest', items: [], totalItems: 0 };

  getWishList(): IWishList {
    if (typeof window === 'undefined') {
      return { id: 'guest', userId: 'guest', items: [], totalItems: 0 };
    }
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.inMemoryWishlist;
      }
      const wishlist = JSON.parse(stored) as IWishList;
      wishlist.totalItems = wishlist.items.length;
      this.inMemoryWishlist = wishlist;
      return wishlist;
    } catch (e) {
      console.warn('localStorage is not available, using in-memory wishlist:', e);
      return this.inMemoryWishlist;
    }
  }

  private saveWishList(wishlist: IWishList): void {
    if (typeof window === 'undefined') return;
    wishlist.totalItems = wishlist.items.length;
    this.inMemoryWishlist = wishlist;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  async addItem(productId: string): Promise<IWishList> {
    const wishlist = this.getWishList();
    const exists = wishlist.items.some(i => i.productId === productId);

    if (!exists) {
      const product = await firstValueFrom(this.productsService.getProductById(productId));
      const mainImg = product.images.find(img => img.isMain)?.imageUrl ?? product.images[0]?.imageUrl ?? undefined;
      const item: IWishListItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: product.id,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        price: product.price,
        discountPrice: product.discountPrice,
        imageUrl: mainImg,
        quantity: 1,
        isAvailable: product.isAvailable,
        stockQuantity: product.stockQuantity,
        isSoldOut: product.isSoldOut
      };
      wishlist.items.push(item);
      this.saveWishList(wishlist);
    }
    return wishlist;
  }

  async removeItem(productId: string): Promise<IWishList> {
    const wishlist = this.getWishList();
    wishlist.items = wishlist.items.filter(i => i.productId !== productId);
    this.saveWishList(wishlist);
    return wishlist;
  }

  clearWishList(): void {
    this.inMemoryWishlist = { id: 'guest', userId: 'guest', items: [], totalItems: 0 };
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }
}
