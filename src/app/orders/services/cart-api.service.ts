import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItemDto {
  productId: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  quantity: number;
  totalPrice: number;
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
  private readonly apiUrl = `${environment.apiUrl}/api/cart`;

  readonly cart = signal<CartDto | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  async getCart(): Promise<CartDto | null> {
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
  }

  async addItem(productId: string, quantity: number = 1): Promise<CartDto | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.post<CartDto>(this.apiUrl, { productId, quantity } as AddToCartDto)
      );
      this.cart.set(data);
      return data;
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to add item.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateQuantity(productId: string, quantity: number): Promise<CartDto | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.put<CartDto>(this.apiUrl, { productId, quantity } as AddToCartDto)
      );
      this.cart.set(data);
      return data;
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
      const data = await firstValueFrom(
        this.http.delete<CartDto>(`${this.apiUrl}/${productId}`)
      );
      this.cart.set(data);
      return data;
    } catch {
      this.error.set('Failed to remove item.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

}
