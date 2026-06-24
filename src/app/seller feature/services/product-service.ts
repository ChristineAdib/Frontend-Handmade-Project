import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import { AuthService } from '../../auth/Services/auth';
import { IProduct } from '../../models/iproduct';
import { ICategory } from '../../seller feature/models/icategory'
import { IProductSummary } from '../../shop feature/models/ishop-with-products';
import { PagedResult } from '../../models/paged-result';
export interface ProductAnalysisResult {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  suggestedPrice: number;
  category: string;
  tags: string[];
}
@Injectable({ providedIn: 'root' })

export class ProductService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(API_URLS.getAllCategories);
  }

  getSubCategories(parentId: string): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(API_URLS.getSubCategories(parentId));
  }

  createProduct(formData: FormData): Observable<IProduct> {
    return this.http.post<IProduct>(API_URLS.createProduct, formData, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: string, formData: FormData): Observable<IProduct> {
    return this.http.put<IProduct>(API_URLS.updateProduct(id), formData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(API_URLS.deleteProduct(id), {
      headers: this.getAuthHeaders()
    });
  }
  getMyProducts(shopId: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<IProductSummary>> {
  return this.http.get<PagedResult<IProductSummary>>(
    API_URLS.getMyProducts(shopId, page, pageSize),
    { headers: this.getAuthHeaders() }
  );
}
getProductById(id: string): Observable<any> {
  return this.http.get<any>(API_URLS.getProductById(id), {
    headers: this.getAuthHeaders()
  });
}

analyzeProductImage(imageBase64: string, mimeType: string): Observable<ProductAnalysisResult> {
  return this.http.post<ProductAnalysisResult>(
    API_URLS.analyzeProductImage,
    { imageBase64, mimeType },
    { headers: this.getAuthHeaders() }
  );
}
}