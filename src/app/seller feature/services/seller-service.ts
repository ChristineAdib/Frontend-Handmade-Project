import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { ISellerProfile } from '../models/iseller-profile';
import { IUpdateSeller } from '../models/iupdate-seller';
import { Auth } from '../../auth/Services/auth';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  getSellerProfile(sellerId: string): Observable<ISellerProfile> {
    return this.http.get<ISellerProfile>(API_URLS.getSellerProfile(sellerId));
  }

  getMyProfile(): Observable<ISellerProfile> {
    return this.http.get<ISellerProfile>(API_URLS.getMySellerProfile, {
      headers: this.getAuthHeaders()
    });
  }

  updateMyProfile(dto: IUpdateSeller): Observable<ISellerProfile> {
    return this.http.put<ISellerProfile>(API_URLS.updateMyProfile, dto, {
      headers: this.getAuthHeaders()
    });
  }
}