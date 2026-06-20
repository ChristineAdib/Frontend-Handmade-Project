import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartApiService } from '../../services/cart-api.service';

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
  readonly orderService = inject(OrderService);
  protected readonly langService = inject(LanguageService);
  protected readonly cartApiService = inject(CartApiService);

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
  }

  private readonly selectedMethodId = toSignal(
    this.checkoutForm.get('deliveryMethodId')!.valueChanges,
    { initialValue: '' }
  );

  readonly selectedDeliveryCost = computed<number | null>(() => {
    const methodId = this.selectedMethodId();
    if (!methodId) return null;
    const method = this.orderService.deliveryMethods().find(m => m.id === methodId);
    return method ? method.cost : null;
  });

  async onSubmit(): Promise<void> {
    if (this.checkoutForm.invalid) return;

    const cart = this.cartApiService.cart();
    if (cart && cart.items.some(item => item.isSoldOut)) {
      this.orderService.error.set(
        this.langService.currentLang() === 'ar'
          ? 'بعض المنتجات في سلتك غير متوفرة حالياً.'
          : 'One or more products in your cart are currently unavailable.'
      );
      return;
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

    const order = await this.orderService.createOrder(dto);
    if (order) {
      await this.cartApiService.getCart();
      this.router.navigate(['/payment', order.id]);
    }
  }
}
