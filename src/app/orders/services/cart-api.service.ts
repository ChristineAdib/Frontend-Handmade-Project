import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuestCartService } from './guest-cart.service';
import { AuthService } from '../../auth/Services/auth';

export interface CartItemDto {
  productId: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
  stockQuantity: number;
  isSoldOut: boolean;
}

export interface CartDto {
  cartId: string;
  items: CartItemDto[];
  totalItems: number;
  totalPrice: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly guestCartService = inject(GuestCartService);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/api/cart`;

  readonly cart = signal<CartDto | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private authSubscription?: Subscription;

  constructor() {
    this.authSubscription = this.authService.authChange$.subscribe(() => {
      this.onAuthChange();
    });
    // Initial load on construct
    this.onAuthChange();
  }

  private async onAuthChange(): Promise<void> {
    if (this.authService.isLoggedIn()) {
      await this.syncGuestCartToRedis();
    } else {
      await this.getCart();
    }
  }

  async syncGuestCartToRedis(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    const guestCart = this.guestCartService.getCart();
    if (guestCart.items.length === 0) {
      await this.getCart();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const body = guestCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      const res = await firstValueFrom(
        this.http.post<CartDto>(`${this.apiUrl}/sync`, body)
      );
      this.cart.set(res);
      this.guestCartService.clearCart();
    } catch (err: any) {
      console.error('Failed to sync guest cart to Redis:', err);
      this.error.set(err?.error?.message || 'Failed to sync cart.');
      // fallback to loading normal cart if sync fails
      await this.getCart();
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCart(): Promise<CartDto | null> {
    if (this.authService.isLoggedIn()) {
      try {
        const data = await firstValueFrom(
          this.http.get<CartDto>(this.apiUrl)
        );
        this.cart.set(data);
        return data;
      } catch {
        this.error.set('Failed to load cart.');
        return null;
      }
    } else {
      const data = this.guestCartService.getCart();
      this.cart.set(data);
      return data;
    }
  }

  async addItem(productId: string, quantity: number = 1): Promise<CartDto | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      if (this.authService.isLoggedIn()) {
        const data = await firstValueFrom(
          this.http.post<CartDto>(this.apiUrl, { productId, quantity } as AddToCartDto)
        );
        this.cart.set(data);
        return data;
      } else {
        const data = await this.guestCartService.addItem(productId, quantity);
        this.cart.set(data);
        return data;
      }
    } catch (err: any) {
      let errMsg = 'Failed to add item.';
      if (err?.error) {
        if (Array.isArray(err.error) && err.error.length > 0) {
          errMsg = err.error[0];
        } else if (typeof err.error === 'object' && err.error.message) {
          errMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errMsg = err.error;
        }
      }
      this.error.set(errMsg);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateQuantity(productId: string, quantity: number): Promise<CartDto | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      if (this.authService.isLoggedIn()) {
        const data = await firstValueFrom(
          this.http.put<CartDto>(this.apiUrl, { productId, quantity } as AddToCartDto)
        );
        this.cart.set(data);
        return data;
      } else {
        const data = await this.guestCartService.updateQuantity(productId, quantity);
        this.cart.set(data);
        return data;
      }
    } catch {
      this.error.set('Failed to update quantity.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(productId: string): Promise<CartDto | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      if (this.authService.isLoggedIn()) {
        const data = await firstValueFrom(
          this.http.delete<CartDto>(`${this.apiUrl}/${productId}`)
        );
        this.cart.set(data);
        return data;
      } else {
        const data = await this.guestCartService.removeItem(productId);
        this.cart.set(data);
        return data;
      }
    } catch {
      this.error.set('Failed to remove item.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }
}
