import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {CreateReviewRequest } from '../Models/CreateReviewRequest';
import { ReviewResponse } from '../Models/ReviewResponse';
import { ReviewSummary } from '../Models/ReviewSummary';
import { PaginatedResult } from '../Models/PaginatedResult';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/reviews`;

  readonly reviews        = signal<ReviewSummary[]>([]);
  readonly selectedReview = signal<ReviewResponse | null>(null);
  readonly isLoading      = signal<boolean>(false);
  readonly error          = signal<string | null>(null);

  async getById(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<ReviewResponse>(`${this.apiUrl}/${id}`)
      );
      this.selectedReview.set(data);
    } catch {
      this.error.set('Review not found.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getProductReviews(
    productId: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<ReviewSummary> | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const params = new HttpParams()
        .set('pageNumber', pageNumber)
        .set('pageSize', pageSize);

      const data = await firstValueFrom(
        this.http.get<PaginatedResult<ReviewSummary>>(
          `${this.apiUrl}/product/${productId}`, { params }
        )
      );
      this.reviews.set(data.items);
      return data;
    } catch {
      this.error.set('Failed to load reviews.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createReview(dto: CreateReviewRequest): Promise<ReviewResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.post<ReviewResponse>(this.apiUrl, dto)
      );
      this.reviews.update(prev => [{
        rating: data.rating,
        comment: data.comment,
        userName: data.userName,
        createdAt: data.createdAt
      }, ...prev]);
      return data;
    } catch {
      this.error.set('Failed to create review.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.reviews.update(prev => prev.filter((_, i) =>
        this.selectedReview()?.id !== id
      ));
      return true;
    } catch {
      this.error.set('Failed to delete review.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }
}