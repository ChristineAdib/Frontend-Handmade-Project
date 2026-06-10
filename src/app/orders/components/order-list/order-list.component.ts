import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderStatus, OrderStatusLabel } from '../../models/order-status';
import { PaymentStatus, PaymentStatusLabel } from '../../../payments/models/payment-status';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  readonly orderService = inject(OrderService);
  protected readonly langService = inject(LanguageService);

  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;
  PaymentStatusLabel = PaymentStatusLabel;

  ngOnInit(): void {
    this.orderService.loadMyOrders();
  }

  private getStatusLabel(status: any, enumType: any): string {
    if (status === null || status === undefined) return '';
    if (typeof status === 'number') return enumType[status] || '';
    const parsed = Number(status);
    if (!isNaN(parsed) && enumType[parsed]) return enumType[parsed];
    return status.toString();
  }

  getStatusClass(status: any): string {
    const label = this.getStatusLabel(status, OrderStatus).toLowerCase();
    return `status-${label}`;
  }

  getPaymentStatusClass(status: any): string {
    const label = this.getStatusLabel(status, PaymentStatus).toLowerCase();
    return `pay-${label}`;
  }

  translateOrderStatus(status: any): string {
    const label = this.getStatusLabel(status, OrderStatus).toLowerCase();
    return this.langService.translate(label as any);
  }

  translatePaymentStatus(status: any): string {
    const label = this.getStatusLabel(status, PaymentStatus).toLowerCase();
    return this.langService.translate(label as any);
  }

  onPageChange(page: number): void {
    this.orderService.loadMyOrders({ pageNumber: page });
  }

  cancelOrder(id: string): void {
    const confirmMsg = this.langService.currentLang() === 'ar' 
      ? 'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟' 
      : 'Are you sure you want to cancel this order?';
    if (confirm(confirmMsg)) {
      this.orderService.cancelOrder(id);
    }
  }
}
