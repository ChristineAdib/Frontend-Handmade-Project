import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { IShop } from '../models/ishop';
import { IShopStats } from '../models/ishop-stats';
import { IShopFilter } from '../models/ishop-filter';
import { ICreateShop } from '../models/icreate-shop';
import { IUpdateShop } from '../models/iupdate-shop';
import { AuthService } from '../../auth/Services/auth';
import { map } from 'rxjs/operators';
import { IShopWithProducts } from '../models/ishop-with-products';





@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  getShopById(id: string): Observable<IShop> {
    return this.http.get<IShop>(API_URLS.getShopById(id));
  }



  getShopWithProducts(id: string): Observable<IShopWithProducts> {
  return this.http.get<IShopWithProducts>(API_URLS.getShopWithProducts(id));
  }

  getTopRatedShops(count: number = 10): Observable<IShop[]> {
    return this.http.get<IShop[]>(API_URLS.getTopRatedShops(count));
  }

  searchShops(filter: IShopFilter): Observable<IShop[]> {
    const params = Object.entries(filter)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return this.http.get<IShop[]>(API_URLS.searchShops(params));
  }

getMyShop(): Observable<IShop> {
  return this.http.get<IShop>(API_URLS.getMyShop, {
    headers: this.getAuthHeaders()
  });
}

getMyShopStats(): Observable<IShopStats> {
  return this.http.get<IShopStats>(API_URLS.getMyShopStats, {
    headers: this.getAuthHeaders()
  }).pipe(map(res => res));
}


  createShop(dto: ICreateShop): Observable<IShop> {
    return this.http.post<IShop>(API_URLS.createShop, dto, {
      headers: this.getAuthHeaders()
    });
  }

 updateShop(id: string, formData: FormData): Observable<IShop> {
  return this.http.put<IShop>(API_URLS.updateShop(id), formData, {
    headers: this.getAuthHeaders()
  });
}

  deleteShop(id: string): Observable<void> {
    return this.http.delete<void>(API_URLS.deleteShop(id), {
      headers: this.getAuthHeaders()
    });
  }
}