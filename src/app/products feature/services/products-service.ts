import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { environment } from '../../../environments/environment';
import { 
  Product, 
  ProductDetailResponse, 
  Category, 
  ProductQuery, 
  PaginatedResponse, 
  ReviewResponse, 
  CreateReviewRequest 
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(query: ProductQuery): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageIndex.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.categoryId && query.categoryId !== '0') {
      params = params.set('categoryId', query.categoryId);
    }

    if (query.search) {
      params = params.set('search', query.search.trim());
    }

    return this.http.get<PaginatedResponse<Product>>(API_URLS.getProducts, { params });
  }

  getProductById(id: string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(API_URLS.getProductById(id));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URLS.getAllCategories);
  }

  getProductReviews(productId: string, pageNumber: number = 1, pageSize: number = 5): Observable<PaginatedResponse<ReviewResponse>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<ReviewResponse>>(
      `${environment.domain}/api/Reviews/product/${productId}`, 
      { params }
    );
  }

  createReview(review: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(
      `${environment.domain}/api/Reviews`, 
      review
    );
  }
}
