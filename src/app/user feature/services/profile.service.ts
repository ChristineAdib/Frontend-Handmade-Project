import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { UserProfile } from '../models/user-profile';
import { FollowedShop } from '../models/followed-shop';
import { UserReview } from '../models/user-review';
import { OrderSummary } from '../../orders/models/order-models';
import { PagedResult } from '../../models/paged-result';
import { ApiResponse } from '../../auth/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_URLS.getProfile);
  }

  getFollowedShops(): Observable<FollowedShop[]> {
    return this.http.get<FollowedShop[]>(API_URLS.getProfileFollowedShops);
  }

  getOrders(pageNumber: number = 1, pageSize: number = 5): Observable<PagedResult<OrderSummary>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<OrderSummary>>(API_URLS.getProfileOrders, { params });
  }

  getMyReviews(): Observable<UserReview[]> {
    return this.http.get<UserReview[]>(API_URLS.getMyReviews);
  }

  updateProfile(userId: string, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(API_URLS.updateUserProfile(userId), formData);
  }
}
