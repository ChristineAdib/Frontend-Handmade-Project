import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../constants/API_URLS';
import {
  ICreateProductDto,
  IPagedResult,
  IProductQueryDto,
  IProductResponseDto,
  IProductSummaryDto,
  IUpdateProductDto,
} from '../models/iproductAPI';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  // ── GET /api/Products/{id} ─────────────────────────────────────────────────
  getProduct(id: string): Observable<IProductResponseDto> {
    return this.http.get<IProductResponseDto>(API_URLS.getProductById(id));
  }

  // ── GET /api/Products?... ──────────────────────────────────────────────────
  // Tags are sent as repeated params: ?tags=handmade&tags=silver
  getProducts(
    query: IProductQueryDto = {}
  ): Observable<IPagedResult<IProductSummaryDto>> {
    let params = new HttpParams();

    if (query.pageNumber != null)
      params = params.set('pageNumber', query.pageNumber);
    if (query.pageSize != null)
      params = params.set('pageSize', query.pageSize);
    if (query.search)
      params = params.set('search', query.search);
    if (query.categoryId)
      params = params.set('categoryId', query.categoryId);
    if (query.shopId)
      params = params.set('shopId', query.shopId);
    if (query.minPrice != null)
      params = params.set('minPrice', query.minPrice);
    if (query.maxPrice != null)
      params = params.set('maxPrice', query.maxPrice);
    if (query.minRating != null)
      params = params.set('minRating', query.minRating);
    if (query.status)
      params = params.set('status', query.status);
    if (query.sortBy)
      params = params.set('sortBy', query.sortBy);
    if (query.sortDescending != null)
      params = params.set('sortDescending', query.sortDescending);

    // Tags must be repeated params, NOT comma-separated
    if (query.tags && query.tags.length > 0) {
      for (const tag of query.tags) {
        params = params.append('tags', tag);
      }
    }

    return this.http.get<IPagedResult<IProductSummaryDto>>(
      API_URLS.getAllProducts,
      { params }
    );
  }

  // ── POST /api/Products  [FromForm] ────────────────────────────────────────
  createProduct(dto: ICreateProductDto): Observable<IProductResponseDto> {
    const formData = this._buildCreateFormData(dto);
    return this.http.post<IProductResponseDto>(
      API_URLS.createProduct,
      formData
    );
  }

  // ── PUT /api/Products/{id}  [FromForm] ────────────────────────────────────
  updateProduct(
    id: string,
    dto: IUpdateProductDto
  ): Observable<IProductResponseDto> {
    const formData = this._buildUpdateFormData(dto);
    return this.http.put<IProductResponseDto>(
      API_URLS.updateProduct(id),
      formData
    );
  }

  // ── DELETE /api/Products/{id} ─────────────────────────────────────────────
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(API_URLS.deleteProduct(id));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers — FormData builders
  // ─────────────────────────────────────────────────────────────────────────

  private _buildCreateFormData(dto: ICreateProductDto): FormData {
    const fd = new FormData();

    fd.append('titleEn', dto.titleEn);
    fd.append('titleAr', dto.titleAr);
    if (dto.descriptionEn) fd.append('descriptionEn', dto.descriptionEn);
    if (dto.descriptionAr) fd.append('descriptionAr', dto.descriptionAr);
    fd.append('price', dto.price.toString());
    fd.append('quantity', dto.quantity.toString());
    fd.append('categoryId', dto.categoryId);
    fd.append('shopId', dto.shopId);

    // Multiple images — same field name for each file
    for (const image of dto.images) {
      fd.append('images', image, image.name);
    }

    // Tags as repeated fields (matches List<string> Tags on backend)
    for (const tag of dto.tags) {
      fd.append('tags', tag);
    }

    return fd;
  }

  private _buildUpdateFormData(dto: IUpdateProductDto): FormData {
    const fd = new FormData();

    if (dto.titleEn != null) fd.append('titleEn', dto.titleEn);
    if (dto.titleAr != null) fd.append('titleAr', dto.titleAr);
    if (dto.descriptionEn != null)
      fd.append('descriptionEn', dto.descriptionEn);
    if (dto.descriptionAr != null)
      fd.append('descriptionAr', dto.descriptionAr);
    if (dto.price != null) fd.append('price', dto.price.toString());
    if (dto.discountPrice != null)
      fd.append('discountPrice', dto.discountPrice.toString());
    if (dto.quantity != null) fd.append('quantity', dto.quantity.toString());
    if (dto.status != null) fd.append('status', dto.status);
    if (dto.categoryId != null) fd.append('categoryId', dto.categoryId);

    // Tags as repeated fields
    if (dto.tags) {
      for (const tag of dto.tags) {
        fd.append('tags', tag);
      }
    }

    // IDs of images to remove
    if (dto.removeImageIds) {
      for (const imgId of dto.removeImageIds) {
        fd.append('removeImageIds', imgId);
      }
    }

    // New image files to add
    if (dto.newImages) {
      for (const image of dto.newImages) {
        fd.append('newImages', image, image.name);
      }
    }

    return fd;
  }
}
