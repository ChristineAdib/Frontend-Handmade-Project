import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { OrderStatus, OrderStatusLabel } from '../../models/order-status';
import { PaymentStatus, PaymentStatusLabel } from '../../../payments/models/payment-status';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly orderService = inject(OrderService);
  readonly paymentService = inject(PaymentService);
  protected readonly langService = inject(LanguageService);

  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;
  PaymentStatusLabel = PaymentStatusLabel;
  orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.orderService.getById(this.orderId);
    }
  }

  private getStatusLabel(status: any, enumType: any): string {
    if (status === null || status === undefined) return '';
    if (typeof status === 'number') return enumType[status] || '';
    const parsed = Number(status);
    if (!isNaN(parsed) && enumType[parsed]) return enumType[parsed];
    return status.toString();
  }

  getOrderStatusClass(status: any): string {
    const label = this.getStatusLabel(status, OrderStatus).toLowerCase();
    return `badge-${label}`;
  }

  getPaymentStatusClass(status: any): string {
    const label = this.getStatusLabel(status, PaymentStatus).toLowerCase();
    if (label === 'paid') return 'badge-delivered';
    if (label === 'failed') return 'badge-cancelled';
    return `badge-${label}`;
  }

  translateOrderStatus(status: any): string {
    const label = this.getStatusLabel(status, OrderStatus).toLowerCase();
    return this.langService.translate(label as any);
  }

  translatePaymentStatus(status: any): string {
    const label = this.getStatusLabel(status, PaymentStatus).toLowerCase();
    return this.langService.translate(label as any);
  }

  goToPayment(): void {
    this.router.navigate(['/payment', this.orderId]);
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
