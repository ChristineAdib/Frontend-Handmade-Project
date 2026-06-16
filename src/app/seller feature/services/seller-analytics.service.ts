import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { AuthService } from '../../auth/Services/auth';

@Injectable({
  providedIn: 'root'
})
export class SellerAnalyticsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  private buildParams(preset: string, startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams().set('preset', preset);
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return params;
  }

  getSummary(preset: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/summary`, {
      headers: this.getAuthHeaders(),
      params: this.buildParams(preset, startDate, endDate)
    });
  }

  getRevenue(preset: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/revenue`, {
      headers: this.getAuthHeaders(),
      params: this.buildParams(preset, startDate, endDate)
    });
  }

  getOrders(preset: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/orders`, {
      headers: this.getAuthHeaders(),
      params: this.buildParams(preset, startDate, endDate)
    });
  }

  getCustomers(preset: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/customers`, {
      headers: this.getAuthHeaders(),
      params: this.buildParams(preset, startDate, endDate)
    });
  }

  getInventory(): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/inventory`, {
      headers: this.getAuthHeaders()
    });
  }

  getRatings(): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/ratings`, {
      headers: this.getAuthHeaders()
    });
  }

  getInsights(preset: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/insights`, {
      headers: this.getAuthHeaders(),
      params: this.buildParams(preset, startDate, endDate)
    });
  }

  getDrillDown(date: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.sellerAnalytics}/drilldown`, {
      headers: this.getAuthHeaders(),
      params: new HttpParams().set('date', date)
    });
  }
}
