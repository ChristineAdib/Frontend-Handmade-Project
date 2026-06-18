import { Injectable, inject } from '@angular/core';
import { ProductsService } from '../../products feature/services/products-service';
import { firstValueFrom } from 'rxjs';
import { CartDto, CartItemDto } from './cart-api.service';

@Injectable({ providedIn: 'root' })
export class GuestCartService {
  private readonly productsService = inject(ProductsService);
  private readonly storageKey = 'guest_cart';

  getCart(): CartDto {
    if (typeof window === 'undefined') {
      return { cartId: 'guest', items: [], totalItems: 0, totalPrice: 0 };
    }
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return { cartId: 'guest', items: [], totalItems: 0, totalPrice: 0 };
    }
    try {
      const cart = JSON.parse(stored) as CartDto;
      this.recalculateCart(cart);
      return cart;
    } catch {
      return { cartId: 'guest', items: [], totalItems: 0, totalPrice: 0 };
    }
  }

  private saveCart(cart: CartDto): void {
    if (typeof window === 'undefined') return;
    this.recalculateCart(cart);
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  private recalculateCart(cart: CartDto): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.quantity * (item.discountPrice ?? item.price)), 0);
  }

  async addItem(productId: string, quantity: number = 1): Promise<CartDto> {
    const cart = this.getCart();
    const existing = cart.items.find(i => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.totalPrice = existing.quantity * (existing.discountPrice ?? existing.price);
    } else {
      const product = await firstValueFrom(this.productsService.getProductById(productId));
      const mainImg = product.images.find(img => img.isMain)?.imageUrl ?? product.images[0]?.imageUrl ?? null;
      const item: CartItemDto = {
        productId: product.id,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        imageUrl: mainImg,
        quantity: quantity,
        totalPrice: quantity * (product.discountPrice ?? product.price),
        isAvailable: product.isAvailable,
        stockQuantity: product.stockQuantity,
        isSoldOut: product.isSoldOut
      };
      cart.items.push(item);
    }

    this.saveCart(cart);
    return cart;
  }

  async updateQuantity(productId: string, quantity: number): Promise<CartDto> {
    const cart = this.getCart();
    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId !== productId);
      } else {
        existing.quantity = quantity;
        existing.totalPrice = existing.quantity * (existing.discountPrice ?? existing.price);
      }
      this.saveCart(cart);
    }
    return cart;
  }

  async removeItem(productId: string): Promise<CartDto> {
    const cart = this.getCart();
    cart.items = cart.items.filter(i => i.productId !== productId);
    this.saveCart(cart);
    return cart;
  }

  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}
