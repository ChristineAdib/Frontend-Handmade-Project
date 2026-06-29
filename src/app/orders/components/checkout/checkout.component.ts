import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartApiService } from '../../services/cart-api.service';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';
import { CustomRequestDetailDto } from '../../../custom-studio/models/custom-studio.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly orderService = inject(OrderService);
  protected readonly langService = inject(LanguageService);
  private readonly cartApiService = inject(CartApiService);
  private readonly customStudioService = inject(CustomStudioService);

  requestId = signal<string | null>(null);
  customRequest = signal<CustomRequestDetailDto | null>(null);

  checkoutForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    deliveryMethodId: ['', Validators.required],
    couponCode: [''],
    notes: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    this.orderService.loadDeliveryMethods();
    this.route.queryParams.subscribe(params => {
      const id = params['requestId'];
      if (id) {
        this.requestId.set(id);
        this.customStudioService.getCustomRequestDetails(id).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.customRequest.set(res.data);
            }
          },
          error: (err) => {
            console.error('Failed to load custom request details for checkout:', err);
          }
        });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.checkoutForm.invalid) return;

    if (!this.requestId()) {
      const cart = this.cartApiService.cart();
      if (cart && cart.items.some(item => item.isSoldOut)) {
        this.orderService.error.set(
          this.langService.currentLang() === 'ar'
            ? 'بعض المنتجات في سلتك غير متوفرة حالياً.'
            : 'One or more products in your cart are currently unavailable.'
        );
        return;
      }
    }

    const dto = {
      firstName: this.checkoutForm.value.firstName!,
      lastName: this.checkoutForm.value.lastName!,
      street: this.checkoutForm.value.street!,
      city: this.checkoutForm.value.city!,
      country: this.checkoutForm.value.country!,
      deliveryMethodId: this.checkoutForm.value.deliveryMethodId!,
      couponCode: this.checkoutForm.value.couponCode || undefined,
      notes: this.checkoutForm.value.notes || undefined
    };

    if (this.requestId()) {
      this.orderService.isCreating.set(true);
      this.orderService.error.set(null);
      this.customStudioService.checkout(this.requestId()!, {
        requestId: this.requestId()!,
        ...dto
      }).subscribe({
        next: (res) => {
          this.orderService.isCreating.set(false);
          if (res.success && res.data) {
            const orderId = res.data.id || res.data.orderId;
            this.router.navigate(['/payment', orderId]);
          } else {
            this.orderService.error.set(res.message || 'Failed to process checkout');
          }
        },
        error: (err) => {
          this.orderService.isCreating.set(false);
          this.orderService.error.set('An error occurred during checkout.');
          console.error(err);
        }
      });
    } else {
      const order = await this.orderService.createOrder(dto);
      if (order) {
        await this.cartApiService.getCart();
        this.router.navigate(['/payment', order.id]);
      }
    }
  }
}
