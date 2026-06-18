import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentResponse, PaymentIntentResponse, CreateWithdrawalRequest, SellerWallet } from '../models/payment-models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/payments`;
  private readonly payoutUrl = `${environment.apiUrl}/api/payouts`;

  readonly payment = signal<PaymentResponse | null>(null);
  readonly checkoutUrl = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  async createPaymentIntent(orderId: string): Promise<PaymentIntentResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.post<PaymentIntentResponse>(`${this.apiUrl}/create-intent/${orderId}`, {})
      );
      this.checkoutUrl.set(data.checkoutUrl);
      return data;
    } catch {
      this.error.set('Failed to create payment.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async requestWithdrawal(dto: CreateWithdrawalRequest): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post(`${this.payoutUrl}/request`, dto)
      );
      return true;
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Withdrawal failed.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async processPendingPayouts(): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post(`${this.payoutUrl}/process-pending`, {})
      );
      return true;
    } catch {
      this.error.set('Failed to process payouts.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getSellerWallet(): Promise<SellerWallet | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(
        this.http.get<SellerWallet>(`${this.payoutUrl}/wallet`)
      );
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to fetch wallet details.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }
}
