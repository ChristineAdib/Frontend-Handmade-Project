import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SafeUrlPipe } from '../../../core/pipes/safe-url.pipe';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../../orders/services/order.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly paymentService = inject(PaymentService);
  readonly orderService = inject(OrderService);
  protected readonly langService = inject(LanguageService);

  private pollTimer: any;
  readonly paymentDone = signal<boolean>(false);
  readonly paymentSuccess = signal<boolean>(false);
  readonly paymentFailed = signal<boolean>(false);
  readonly iframeUrl = signal<string>('');
  readonly showIframe = signal<boolean>(false);

  orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    if (this.orderId) {
      this.initPayment();
    }
  }

  ngOnDestroy(): void {
    this.clearPoll();
  }

  async initPayment(): Promise<void> {
    const result = await this.paymentService.createPaymentIntent(this.orderId);
    if (result?.checkoutUrl) {
      this.iframeUrl.set(result.checkoutUrl);
      this.showIframe.set(true);
      this.startPolling();
    }
  }

  private startPolling(): void {
    this.pollTimer = setInterval(async () => {
      await this.orderService.getById(this.orderId);
      const order = this.orderService.selectedOrder();
      if (!order) return;

      if (order.paymentStatus === 2) {
        this.paymentSuccess.set(true);
        this.paymentDone.set(true);
        this.showIframe.set(false);
        this.clearPoll();
      } else if (order.paymentStatus === 3) {
        this.paymentFailed.set(true);
        this.paymentDone.set(true);
        this.showIframe.set(false);
        this.clearPoll();
      }
    }, 3000);
  }

  private clearPoll(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
