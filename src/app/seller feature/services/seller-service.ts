import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { ISellerProfile } from '../models/iseller-profile';
import { IUpdateSeller } from '../models/iupdate-seller';
import { AuthService } from '../../auth/Services/auth';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

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

 updateMyProfile(formData: FormData): Observable<ISellerProfile> {
  return this.http.put<ISellerProfile>(API_URLS.updateMyProfile, formData, {
    headers: this.getAuthHeaders()
  });
}
}