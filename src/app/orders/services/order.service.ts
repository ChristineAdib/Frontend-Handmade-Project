import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderResponse, OrderSummary, CreateOrderRequest, UpdateOrderStatusRequest, OrderQuery } from '../models/order-models';
import { PagedResult } from '../../models/paged-result';
import { DeliveryMethod } from '../models/delivery-method';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/orders`;

  readonly orders = signal<OrderSummary[]>([]);
  readonly selectedOrder = signal<OrderResponse | null>(null);
  readonly deliveryMethods = signal<DeliveryMethod[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);

  async loadMyOrders(query: OrderQuery = {}): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams()
        .set('pageNumber', query.pageNumber ?? 1)
        .set('pageSize', query.pageSize ?? 10);

      if (query.status) params = params.set('status', query.status);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortDescending !== undefined) params = params.set('sortDescending', query.sortDescending);

      const res = await firstValueFrom(
        this.http.get<PagedResult<OrderSummary>>(this.apiUrl, { params })
      );
      this.orders.set(res.items);
      this.totalCount.set(res.totalCount);
      this.currentPage.set(res.pageNumber);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Failed to load orders.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getById(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<OrderResponse>(`${this.apiUrl}/${id}`)
      );
      this.selectedOrder.set(data);
    } catch {
      this.error.set('Order not found.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async createOrder(dto: CreateOrderRequest): Promise<OrderResponse | null> {
    this.isCreating.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.post<OrderResponse>(this.apiUrl, dto)
      );
      return data;
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to create order.');
      return null;
    } finally {
      this.isCreating.set(false);
    }
  }

  async updateStatus(id: string, dto: UpdateOrderStatusRequest): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/status`, dto)
      );
      this.selectedOrder.set(data);
      return true;
    } catch (err: any) {
      let errorMessage = 'Failed to update order status.';
      if (err?.error) {
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (Array.isArray(err.error) && err.error.length > 0) {
          errorMessage = err.error[0];
        } else if (err.error.message) {
          errorMessage = err.error.message;
        }
      }
      this.error.set(errorMessage);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelOrder(id: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/${id}/cancel`, {})
      );
      this.orders.update(prev =>
        prev.map(o => o.id === id ? { ...o, status: 5 } : o)
      );
      return true;
    } catch {
      this.error.set('Failed to cancel order.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadDeliveryMethods(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<DeliveryMethod[]>(`${environment.apiUrl}/api/delivery-methods`)
      );
      this.deliveryMethods.set(data.filter(d => d.isActive));
    } catch {
      this.error.set('Failed to load delivery methods.');
    }
  }

  getSellerOrders(shopId: string, page: number = 1): Observable<any> {
  const params = new HttpParams()
    .set('pageNumber', page)
    .set('pageSize', 10);
  return this.http.get<any>(`${this.apiUrl}/seller/${shopId}`, { params });
}
getOrderById(id: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}
}
