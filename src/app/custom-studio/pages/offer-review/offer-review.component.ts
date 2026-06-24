import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestDetailDto, CustomOfferDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-offer-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './offer-review.component.html',
  styleUrl: './offer-review.component.css'
})
export class OfferReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  activeOffer = signal<CustomOfferDto | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  // Modals / Panels toggles
  showCheckoutForm = signal<boolean>(false);
  showChangeRequestForm = signal<boolean>(false);

  // Checkout address command state
  checkoutForm = {
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    country: 'Egypt',
    deliveryMethodId: '00000000-0000-0000-0000-000000000000', // Default empty GUID
    couponCode: '',
    notes: ''
  };

  // Change request state
  changeFeedbackText = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadOfferDetails(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadOfferDetails(id: string): void {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          
          // Get the latest active offer
          if (res.data.customOffers && res.data.customOffers.length > 0) {
            const sorted = [...res.data.customOffers].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.activeOffer.set(sorted[0]);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load offer details');
        console.error(err);
      }
    });
  }

  acceptOffer(): void {
    const offer = this.activeOffer();
    if (!offer) return;

    this.submitting.set(true);
    this.customStudioService.acceptOffer(this.requestId(), offer.id).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastr.success('Offer accepted! Please complete checkout details.');
          this.showCheckoutForm.set(true);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.error('Failed to accept offer');
        console.error(err);
      }
    });
  }

  rejectOffer(): void {
    const offer = this.activeOffer();
    if (!offer) return;

    if (confirm('Are you sure you want to reject this custom offer? This negotiation will be closed.')) {
      this.submitting.set(true);
      this.customStudioService.rejectOffer(this.requestId(), offer.id).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastr.info('Offer rejected.');
            this.router.navigate(['/custom-studio/negotiation', this.requestId()]);
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.toastr.error('Failed to reject offer');
          console.error(err);
        }
      });
    }
  }

  submitChangeRequest(): void {
    const offer = this.activeOffer();
    const feedback = this.changeFeedbackText().trim();
    if (!offer || !feedback) return;

    this.submitting.set(true);
    this.customStudioService.requestChanges(this.requestId(), offer.id, feedback).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastr.success('Change request sent to seller.');
          this.showChangeRequestForm.set(false);
          this.router.navigate(['/custom-studio/negotiation', this.requestId()]);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.error('Failed to send change request');
        console.error(err);
      }
    });
  }

  submitCheckout(): void {
    if (!this.checkoutForm.firstName || !this.checkoutForm.lastName || !this.checkoutForm.street || !this.checkoutForm.city) {
      this.toastr.warning('Please fill in all required shipping address fields.');
      return;
    }

    this.submitting.set(true);
    this.customStudioService.checkout(this.requestId(), {
      requestId: this.requestId(),
      firstName: this.checkoutForm.firstName,
      lastName: this.checkoutForm.lastName,
      street: this.checkoutForm.street,
      city: this.checkoutForm.city,
      country: this.checkoutForm.country,
      deliveryMethodId: this.checkoutForm.deliveryMethodId,
      couponCode: this.checkoutForm.couponCode || undefined,
      notes: this.checkoutForm.notes || undefined
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.toastr.success('Order created! Redirecting to payment portal...');
          const orderId = res.data.id || res.data.orderId;
          this.router.navigate(['/payment', orderId]);
        } else {
          this.toastr.error('Failed to process checkout');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.error('An error occurred during checkout.');
        console.error(err);
      }
    });
  }
}
