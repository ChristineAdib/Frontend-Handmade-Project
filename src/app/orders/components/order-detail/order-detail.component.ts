import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { OrderStatus, OrderStatusLabel } from '../../models/order-status';
import { PaymentStatus, PaymentStatusLabel } from '../../../payments/models/payment-status';

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

  goToPayment(): void {
    this.router.navigate(['/payment', this.orderId]);
  }
}
