import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderStatus, OrderStatusLabel } from '../../models/order-status';
import { PaymentStatus, PaymentStatusLabel } from '../../../payments/models/payment-status';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  readonly orderService = inject(OrderService);

  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;
  PaymentStatusLabel = PaymentStatusLabel;

  ngOnInit(): void {
    this.orderService.loadMyOrders();
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'status-pending';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Shipped: return 'status-shipped';
      case OrderStatus.Delivered: return 'status-delivered';
      case OrderStatus.Cancelled: return 'status-cancelled';
      case OrderStatus.Refunded: return 'status-refunded';
      default: return '';
    }
  }

  onPageChange(page: number): void {
    this.orderService.loadMyOrders({ pageNumber: page });
  }

  cancelOrder(id: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(id);
    }
  }
}
