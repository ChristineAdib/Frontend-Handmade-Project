import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.css']
})
export class PaymentCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly langService = inject(LanguageService);

  status: 'success' | 'failed' | 'pending' = 'pending';
  orderId = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['success'] === 'true' ? 'success' : 'failed';
      this.orderId = params['gid'] || params['order'] || '';

      if (window.parent && window !== window.parent) {
        window.parent.postMessage({ type: 'payment-callback', status: this.status, orderId: this.orderId }, '*');
      }
    });
  }
}
