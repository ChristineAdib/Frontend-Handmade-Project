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
import { ICategory } from '../../models/icategory';
import { IProduct } from '../../models/iproduct';
import { IProductSummary } from '../../shop feature/models/ishop-with-products';
import { PagedResult } from '../../models/paged-result';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  // Mock Data (retained for backward compatibility / reference if needed)
  categories: ICategory[] = [
    { ID: 1, Name: 'Jewelry' },
    { ID: 2, Name: 'Pottery' },
    { ID: 3, Name: 'Embroidery' },
  ];

  ProductList: IProduct[] = [
    { ID: 1, Name: 'Silver Bracelet',    Quantity: 5, Price: 250, Img: 'silverBracelet.jpg',  CategoryID: 1 },
    { ID: 2, Name: 'Gold Necklace',      Quantity: 2, Price: 500, Img: 'necklace.jpg',  CategoryID: 1 },
    { ID: 3, Name: 'Clay Vase',          Quantity: 1, Price: 180, Img: 'vase.jpg',      CategoryID: 2 },
    { ID: 4, Name: 'Ceramic Bowl',       Quantity: 0, Price: 120, Img: 'bowl.jpg',      CategoryID: 2 },
    { ID: 5, Name: 'Embroidered Bag',    Quantity: 3, Price: 350, Img: 'bag.jpg',       CategoryID: 3 },
    { ID: 6, Name: 'Hand-painted Scarf', Quantity: 0, Price: 200, Img: 'handmadeScarf.jpg',     CategoryID: 3 },
  ];

  // Mock methods (retained for reference)
  buy(product: IProduct): void {
    if (product.Quantity > 0) {
      product.Quantity--;
    }
  }

  // Multi-signature getProducts to support both query-based and pagination-based fetches
  getProducts(query: ProductQuery): Observable<PaginatedResponse<Product>>;
  getProducts(page: number, pageSize: number): Observable<PagedResult<IProductSummary>>;
  getProducts(queryOrPage: ProductQuery | number = 1, pageSize?: number): Observable<any> {
    if (typeof queryOrPage === 'object') {
      const query = queryOrPage as ProductQuery;
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
    } else {
      const page = queryOrPage as number;
      const size = pageSize ?? 8;
      return this.http.get<PagedResult<IProductSummary>>(
        `${API_URLS.getProducts}?pageNumber=${page}&pageSize=${size}`
      );
    }
  }

  getProductById(id: string): Observable<ProductDetailResponse>;
  getProductById(id: number): IProduct | null;
  getProductById(id: string | number): any {
    if (typeof id === 'number') {
      return this.ProductList.find(p => p.ID === id) || null;
    }
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

  getFilteredProducts(searchName: string, categoryID: number): IProduct[] {
    return this.ProductList.filter(p => {
      const matchName = p.Name.toLowerCase()
                        .includes(searchName.toLowerCase());
      const matchCat = categoryID == 0 || p.CategoryID == categoryID;
      return matchName && matchCat;
    });
  }
}
