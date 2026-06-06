import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { IWishList } from '../models/iwish-list';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);

  getWishList(): Observable<IWishList> {
    return this.http.get<IWishList>(API_URLS.getWishList, {
      // withCredentials: true,
    });
  }

  addItem(productId: string): Observable<IWishList> {
    return this.http.post<IWishList>(
      API_URLS.addToWishList,
      { productId },
      // { withCredentials: true }
    );
  }

  removeItem(productId: string): Observable<IWishList> {
    return this.http.delete<IWishList>(
      API_URLS.removeFromWishList(productId),
      // { withCredentials: true }
    );
  }
}