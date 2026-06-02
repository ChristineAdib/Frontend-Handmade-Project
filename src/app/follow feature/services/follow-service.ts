import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { IFollow } from '../models/ifollow';
import { IShopFollower } from '../models/ishop-follower';
import { AuthService } from '../../auth/Services/auth';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  followShop(shopId: string): Observable<void> {
    return this.http.post<void>(API_URLS.followShop(shopId), {}, {
      headers: this.getAuthHeaders()
    });
  }

  unfollowShop(shopId: string): Observable<void> {
    return this.http.delete<void>(API_URLS.unfollowShop(shopId), {
      headers: this.getAuthHeaders()
    });
  }

  isFollowing(shopId: string): Observable<boolean> {
    return this.http.get<boolean>(API_URLS.isFollowing(shopId), {
      headers: this.getAuthHeaders()
    });
  }

  getFollowedShops(): Observable<IFollow[]> {
    return this.http.get<IFollow[]>(API_URLS.getFollowedShops, {
      headers: this.getAuthHeaders()
    });
  }

  getShopFollowers(shopId: string): Observable<IShopFollower[]> {
    return this.http.get<IShopFollower[]>(API_URLS.getShopFollowers(shopId), {
      headers: this.getAuthHeaders()
    });
  }
}