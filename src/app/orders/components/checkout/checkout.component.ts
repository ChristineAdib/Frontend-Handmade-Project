import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartApiService, CartItemDto } from '../../services/cart-api.service';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';
import { CustomRequestDetailDto, CustomConfiguration } from '../../../custom-studio/models/custom-studio.models';
import { environment } from '../../../../environments/environment';

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
  readonly cart = this.cartApiService.cart;

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
      } else {
        this.cartApiService.getCart();
      }
    });
  }

  getSelectedDeliveryCost(): number {
    const id = this.checkoutForm.value.deliveryMethodId;
    const method = this.orderService.deliveryMethods().find(m => m.id === id);
    return method ? method.cost : 0;
  }

  getSubtotal(): number {
    if (this.requestId() && this.customRequest()) {
      return this.customRequest()?.customService?.price || 0;
    }
    const cart = this.cart();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getDiscount(): number {
    if (this.requestId() && this.customRequest()) {
      return 0;
    }
    const cart = this.cart();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => {
      if (item.discountPrice !== null && item.discountPrice < item.price) {
        return sum + (item.price - item.discountPrice) * item.quantity;
      }
      return sum;
    }, 0);
  }

  getGrandTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getSelectedDeliveryCost();
  }

  getImageUrl(item: CartItemDto): string {
    if (!item.imageUrl) return '';
    if (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://') || item.imageUrl.startsWith('//')) {
      return item.imageUrl;
    }
    return `${environment.apiUrl}/${item.imageUrl}`;
  }

  getCustomConfiguration(): CustomConfiguration | null {
    const config = this.customRequest()?.customConfiguration?.configurationDataJson;
    if (!config) return null;
    try {
      return JSON.parse(config) as CustomConfiguration;
    } catch (e) {
      console.error('Failed to parse custom configuration:', e);
      return null;
    }
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
