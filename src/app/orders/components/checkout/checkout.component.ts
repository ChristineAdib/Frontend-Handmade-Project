import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';

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

  async onSubmit(): Promise<void> {
    if (this.checkoutForm.invalid) return;

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
      this.router.navigate(['/payment', order.id]);
    }
  }
}
