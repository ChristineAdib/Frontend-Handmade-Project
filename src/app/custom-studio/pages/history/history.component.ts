import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestSummaryDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

type TabName = 'drafts' | 'negotiations' | 'workspaces' | 'completed';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = signal<boolean>(true);
  activeTab = signal<TabName>('drafts');
  
  // Categorized lists
  draftRequests = signal<CustomRequestSummaryDto[]>([]);
  negotiationRequests = signal<CustomRequestSummaryDto[]>([]);
  workspaceRequests = signal<CustomRequestSummaryDto[]>([]);
  completedRequests = signal<CustomRequestSummaryDto[]>([]);

  ngOnInit(): void {
    this.loadRequestsHistory();
  }

  loadRequestsHistory(): void {
    this.loading.set(true);
    this.customStudioService.getBuyerRequests(1, 100).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const items = res.data.items || [];
          
          // Categorize by status
          this.draftRequests.set(
            items.filter(r => r.status === 'Draft' || r.status === 'Configuring' || r.status === 'ReadyForGeneration')
          );
          this.negotiationRequests.set(
            items.filter(r => r.status === 'Generating' || r.status === 'Generated' || r.status === 'DesignSelected' || r.status === 'SellerMatched' || r.status === 'Negotiation' || r.status === 'OfferSent' || r.status === 'OfferAccepted' || r.status === 'PaymentPending')
          );
          this.workspaceRequests.set(
            items.filter(r => r.status === 'Paid' || r.status === 'InProgress' || r.status === 'Shipped')
          );
          this.completedRequests.set(
            items.filter(r => r.status === 'Completed')
          );
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load design history');
        console.error(err);
      }
    });
  }

  setTab(tabName: TabName): void {
    this.activeTab.set(tabName);
  }

  deleteDraft(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this custom doll draft?')) {
      this.toastr.info('Deleting draft...');
      this.customStudioService.cancelRequest(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Draft deleted.');
            this.loadRequestsHistory();
          }
        }
      });
    }
  }

  routeToNextStep(request: CustomRequestSummaryDto): void {
    const s = request.status;
    if (s === 'Draft' || s === 'Configuring') {
      this.router.navigate(['/custom-studio/wizard', request.id]);
    } else if (s === 'ReadyForGeneration' || s === 'Generating') {
      this.router.navigate(['/custom-studio/generating', request.id]);
    } else if (s === 'Generated') {
      this.router.navigate(['/custom-studio/results', request.id]);
    } else if (s === 'DesignSelected') {
      this.router.navigate(['/custom-studio/summary', request.id]);
    } else if (s === 'SellerMatched') {
      this.router.navigate(['/custom-studio/matching', request.id]);
    } else if (s === 'Negotiation' || s === 'OfferSent') {
      this.router.navigate(['/custom-studio/negotiation', request.id]);
    } else if (s === 'OfferAccepted') {
      this.router.navigate(['/custom-studio/offer-review', request.id]);
    } else if (s === 'PaymentPending') {
      this.router.navigate(['/custom-studio/offer-review', request.id]);
    } else if (s === 'Paid' || s === 'InProgress' || s === 'Shipped') {
      this.router.navigate(['/custom-studio/workspace', request.id]);
    } else if (s === 'Completed') {
      this.router.navigate(['/custom-studio/workspace', request.id]);
    }
  }

  trackByRequestId(index: number, item: CustomRequestSummaryDto): string {
    return item.id;
  }
}
