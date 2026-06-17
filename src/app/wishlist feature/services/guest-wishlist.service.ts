import { Injectable, inject } from '@angular/core';
import { ProductsService } from '../../products feature/services/products-service';
import { firstValueFrom } from 'rxjs';
import { IWishList } from '../models/iwish-list';
import { IWishListItem } from '../models/iwish-list-item';

@Injectable({ providedIn: 'root' })
export class GuestWishlistService {
  private readonly productsService = inject(ProductsService);
  private readonly storageKey = 'guest_wishlist';

  getWishList(): IWishList {
    if (typeof window === 'undefined') {
      return { id: 'guest', userId: 'guest', items: [], totalItems: 0 };
    }
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return { id: 'guest', userId: 'guest', items: [], totalItems: 0 };
    }
    try {
      const wishlist = JSON.parse(stored) as IWishList;
      wishlist.totalItems = wishlist.items.length;
      return wishlist;
    } catch {
      return { id: 'guest', userId: 'guest', items: [], totalItems: 0 };
    }
  }

  private saveWishList(wishlist: IWishList): void {
    if (typeof window === 'undefined') return;
    wishlist.totalItems = wishlist.items.length;
    localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
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
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}
