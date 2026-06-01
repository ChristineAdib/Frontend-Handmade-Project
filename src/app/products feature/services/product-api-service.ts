import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProductAPI } from '../models/iproductAPI';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
    // private apiUrl = 'https://api.escuelajs.co/api/v1/products';
  
    constructor(private http: HttpClient){}
  
    getProducts(): Observable<IProductAPI[]>{
      return this.http.get<IProductAPI[]>(API_URLS.getAllProducts);
    }

    searchProducts(title: string): Observable<IProductAPI[]> {
      return this.http.get<IProductAPI[]>(API_URLS.searchProducts(title));
    }
  
}
