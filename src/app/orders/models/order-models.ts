import { OrderStatus } from './order-status';
import { PaymentStatus } from '../../payments/models/payment-status';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  pictureUrl: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderResponse {
  id: string;
  buyerEmail: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
  deliveryMethodName: string;
  deliveryMethodCost: number;
  subTotal: number;
  discountAmount: number | null;
  total: number;
  notes: string | null;
  couponCode: string | null;
  items: OrderItemResponse[];
}

export interface OrderSummary {
  id: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  itemCount: number;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
  deliveryMethodId: string;
  couponCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: OrderStatus | null;
  sortBy?: string | null;
  sortDescending?: boolean;
}
