import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus, OrderStatusLabel } from '../../../orders/models/order-status';

interface SellerOrder {
  id: string;
  buyerName: string;
  orderDate: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;

  // TODO: استبدلي الـ mock data بـ real API call لما يتعمل endpoint الـ seller orders
  orders = signal<SellerOrder[]>([
    { id: '1', buyerName: 'Sara Ahmed',   orderDate: '2025-06-01', status: OrderStatus.Pending,    total: 450,  itemCount: 2 },
    { id: '2', buyerName: 'Mona Ali',     orderDate: '2025-05-28', status: OrderStatus.Processing, total: 320,  itemCount: 1 },
    { id: '3', buyerName: 'Layla Hassan', orderDate: '2025-05-20', status: OrderStatus.Shipped,    total: 780,  itemCount: 3 },
    { id: '4', buyerName: 'Nour Omar',    orderDate: '2025-05-15', status: OrderStatus.Delivered,  total: 210,  itemCount: 1 },
    { id: '5', buyerName: 'Hana Khaled',  orderDate: '2025-05-10', status: OrderStatus.Cancelled,  total: 560,  itemCount: 2 },
  ]);

  selectedStatus = signal<OrderStatus | null>(null);
  statuses = Object.values(OrderStatus).filter(v => typeof v === 'number') as OrderStatus[];

  filteredOrders() {
    const status = this.selectedStatus();
    if (status === null) return this.orders();
    return this.orders().filter(o => o.status === status);
  }

  filterByStatus(status: OrderStatus | null) {
    this.selectedStatus.set(status);
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.Pending]:    'status-pending',
      [OrderStatus.Processing]: 'status-processing',
      [OrderStatus.Shipped]:    'status-shipped',
      [OrderStatus.Delivered]:  'status-delivered',
      [OrderStatus.Cancelled]:  'status-cancelled',
      [OrderStatus.Refunded]:   'status-refunded',
    };
    return map[status];
  }
}