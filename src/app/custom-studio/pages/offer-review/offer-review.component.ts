import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestDetailDto, CustomOfferDto, GeneratedDesignDto, parseDesignSummary, DesignSummary } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-offer-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './offer-review.component.html',
  styleUrl: './offer-review.component.css'
})

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
  customService = signal<any | null>(null);
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

  selectedDesign(): GeneratedDesignDto | null {
    const request = this.requestDetails();
    if (!request) return null;
    return request.selectedDesign || request.generatedDesigns?.find(d => d.id === request.selectedDesignId) || null;
  }

  designSummary(): DesignSummary {
    const parsed = parseDesignSummary(this.selectedDesign());
    if (Object.keys(parsed).length > 0) return parsed;

    const raw = this.requestDetails()?.customConfiguration?.configurationDataJson;
    if (!raw) return {};
    try {
      const cfg = JSON.parse(raw);
      const hair = cfg.Hair || {};
      const outfit = cfg.Outfit || {};
      const accessories = cfg.Accessories || {};
      const personalization = cfg.Personalization || {};
      return {
        gender: cfg.Gender || cfg.gender,
        height: cfg.Size || cfg.size,
        skinTone: cfg.SkinTone || cfg.skinTone,
        hairStyle: hair.Style || cfg.hairStyle,
        hairColor: hair.Color || cfg.hairColor,
        outfit: outfit.Description || cfg.outfitStyle,
        accessories: accessories.Description || (Array.isArray(cfg.accessories) ? cfg.accessories.join(', ') : cfg.accessories),
        personalization: personalization.LabelText || cfg.personalizationName || cfg.AdditionalNotes,
        referenceImage: cfg.ReferenceImageUrl || this.requestDetails()?.referenceImageUrl
      };
    } catch {
      return {};
    }
  }

  summaryPairs(): { label: string; value: string }[] {
    const s = this.designSummary();
    return [
      { label: 'Gender', value: s.gender || 'Not specified' },
      { label: 'Height', value: s.height || 'Not specified' },
      { label: 'Skin tone', value: s.skinTone || 'Not specified' },
      { label: 'Hair', value: [s.hairStyle, s.hairColor].filter(Boolean).join(', ') || 'Not specified' },
      { label: 'Outfit', value: s.outfit || 'Not specified' },
      { label: 'Accessories', value: s.accessories || 'Not specified' },
      { label: 'Personalization', value: s.personalization || 'Not specified' }
    ];
  }

  estimatedDeliveryDate(): Date | null {
    const service = this.customService();
    if (!service) return null;
    const date = new Date();
    date.setDate(date.getDate() + service.estimatedDeliveryDays);
    return date;
  }

  includedFeatures(): string[] {
    return [
      'Official locked AI design reference',
      'Custom crochet doll production',
      'Progress updates inside the workspace',
      'Escrow-backed checkout and delivery confirmation'
    ];
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

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
          
          if (res.data.customService) {
            this.customService.set(res.data.customService);
          }
          
          // Get the latest active offer and map to customService to preserve HTML bindings
          if (res.data.customOffers && res.data.customOffers.length > 0) {
            const sorted = [...res.data.customOffers].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const active = sorted[0];
            this.activeOffer.set(active);
            
            this.customService.set({
              id: active.id,
              title: `Custom Crochet Doll - Propose`,
              price: active.price,
              estimatedDeliveryDays: active.deliveryTimeDays,
              notes: active.notes,
              status: active.status === 'Pending' ? 'Pending Buyer Approval' : active.status
            });
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load custom service details');
        console.error(err);
      }
    });
  }

  acceptOffer(): void {
    const service = this.customService();
    if (!service) return;

    this.submitting.set(true);
    this.customStudioService.acceptOffer(this.requestId(), service.id).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastr.success('Custom offer accepted! Redirecting to checkout...');
          this.router.navigate(['/checkout'], { queryParams: { requestId: this.requestId() } });
        } else {
          this.toastr.error(res.message || 'Failed to accept custom offer');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.error('Failed to accept custom offer');
        console.error(err);
      }
    });
  }

  rejectOffer(): void {
    const service = this.customService();
    if (!service) return;

    if (confirm('Are you sure you want to reject this custom offer proposal?')) {
      this.submitting.set(true);
      this.customStudioService.rejectOffer(this.requestId(), service.id).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastr.info('Custom offer proposal rejected.');
            this.router.navigate(['/custom-studio/negotiation', this.requestId()]);
          } else {
            this.toastr.error(res.message || 'Failed to reject custom offer proposal');
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.toastr.error('Failed to reject custom offer proposal');
          console.error(err);
        }
      });
    }
  }

  contactSeller(): void {
    this.router.navigate(['/custom-studio/negotiation', this.requestId()]);
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
