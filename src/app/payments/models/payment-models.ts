import { PaymentStatus } from './payment-status';
import { PaymentMethod } from './payment-method';

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string | null;
  providerTransactionId: string | null;
  paidAt: string | null;
}

export interface CreateWithdrawalRequest {
  shopId: string;
  amount: number;
  notes?: string;
}

export interface PaymentIntentResponse {
  checkoutUrl: string;
}
