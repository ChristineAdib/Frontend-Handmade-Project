import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-custom-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './custom-requests.html',
  styleUrl: './custom-requests.css',
})
export class CustomRequests implements OnInit {
  protected readonly langService = inject(LanguageService);
  private shopService = inject(ShopService);
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  shopId = signal<string>('');
  requests = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.shopService.getMyShop().subscribe({
      next: (shop) => {
        this.shopId.set(shop.id);
        this.loadCustomRequests();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load shop details.');
        console.error(err);
      }
    });
  }

  loadCustomRequests(): void {
    this.isLoading.set(true);
    this.customStudioService.getSellerRequests(this.shopId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.requests.set(res.data.items);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load custom requests.');
        console.error(err);
      }
    });
  }

  viewRequest(requestId: string): void {
    this.router.navigate(['/custom-studio/negotiation', requestId]);
  }

  viewWorkspace(requestId: string): void {
    this.router.navigate(['/custom-studio/workspace', requestId]);
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Draft',
      2: 'Configuring',
      3: 'Ready for Generation',
      4: 'Generating',
      5: 'Generated',
      6: 'Design Selected',
      7: 'Seller Matched',
      8: 'Negotiation',
      9: 'Offer Sent',
      10: 'Offer Accepted',
      11: 'Payment Pending',
      12: 'Paid',
      13: 'In Progress',
      14: 'Completed',
      15: 'Cancelled',
      16: 'Rejected'
    };
    return statusMap[status] || 'Unknown';
  }
}
