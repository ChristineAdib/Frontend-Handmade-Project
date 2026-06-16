import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, from, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_URLS } from '../../constants/API_URLS';
import { IWishList } from '../models/iwish-list';
import { GuestWishlistService } from './guest-wishlist.service';
import { AuthService } from '../../auth/Services/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private readonly guestWishlistService = inject(GuestWishlistService);
  private readonly authService = inject(AuthService);

  readonly wishlist = signal<IWishList | null>(null);
  private authSubscription?: Subscription;

  constructor() {
    this.authSubscription = this.authService.authChange$.subscribe(() => {
      this.onAuthChange();
    });
    this.onAuthChange();
  }

  private onAuthChange(): void {
    if (this.authService.isLoggedIn()) {
      this.syncGuestWishlistToRedis();
    } else {
      this.getWishList().subscribe();
    }
  }

  async syncGuestWishlistToRedis(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    const guestWishlist = this.guestWishlistService.getWishList();
    if (guestWishlist.items.length === 0) {
      this.getWishList().subscribe();
      return;
    }

    try {
      const productIds = guestWishlist.items.map(item => item.productId);
      const res = await new Promise<IWishList>((resolve, reject) => {
        this.http.post<IWishList>(`${environment.apiUrl}/api/wishlist/sync`, productIds).subscribe({
          next: data => resolve(data),
          error: err => reject(err)
        });
      });
      this.wishlist.set(res);
      this.guestWishlistService.clearWishList();
    } catch (err) {
      console.error('Failed to sync guest wishlist to Redis:', err);
      this.getWishList().subscribe();
    }
  }

  getWishList(): Observable<IWishList> {
    if (this.authService.isLoggedIn()) {
      return this.http.get<IWishList>(API_URLS.getWishList).pipe(
        tap(data => this.wishlist.set(data))
      );
    } else {
      const data = this.guestWishlistService.getWishList();
      this.wishlist.set(data);
      return of(data);
    }
  }

  addItem(productId: string): Observable<IWishList> {
    if (this.authService.isLoggedIn()) {
      return this.http.post<IWishList>(
        API_URLS.addToWishList,
        { productId }
      ).pipe(
        tap(data => this.wishlist.set(data))
      );
    } else {
      return from(this.guestWishlistService.addItem(productId)).pipe(
        tap(data => this.wishlist.set(data))
      );
    }
  }

  removeItem(productId: string): Observable<IWishList> {
    if (this.authService.isLoggedIn()) {
      return this.http.delete<IWishList>(
        API_URLS.removeFromWishList(productId)
      ).pipe(
        tap(data => this.wishlist.set(data))
      );
    } else {
      return from(this.guestWishlistService.removeItem(productId)).pipe(
        tap(data => this.wishlist.set(data))
      );
    }
  }
}