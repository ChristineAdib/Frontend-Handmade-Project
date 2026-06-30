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
      this.loading.set(true);
      this.customStudioService.getCustomRequestDetails(request.id).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.success && res.data) {
            const hasPhoto = !!res.data.selectedDesign?.imageUrl || !!res.data.conversationId || (res.data.selectedDesign && res.data.selectedDesign.prompt && res.data.selectedDesign.prompt.includes('uploaded person'));
            // If they have reference image URL, route to photo flow, else manual customization wizard
            const refUrl = res.data.selectedDesign?.imageUrl || (res.data.selectedDesign && res.data.selectedDesign.imageUrl);
            const isPhoto = (res.data.selectedDesign && res.data.selectedDesign.prompt && res.data.selectedDesign.prompt.includes('uploaded person')) || (res.data.selectedDesign && res.data.selectedDesign.imageUrl);
            // Actually, we can check if res.data contains a reference image in the serialized config.
            // Let's parse it safely:
            let hasRefImg = false;
            try {
              if (res.data.selectedDesign) {
                hasRefImg = true; // generated
              }
              // Check the actual config
              const configJson = res.data.selectedDesign?.prompt || '';
              if (configJson.includes('inspired by the uploaded person')) {
                hasRefImg = true;
              }
            } catch(e){}

            // Wait, we can check if request.id has an uploaded reference image by fetching request details
            // and checking if res.data has reference image details.
            if (res.data.selectedDesign || isPhoto) {
              this.router.navigate(['/custom-studio/generating', request.id], { queryParams: { mode: 'photo' } });
            } else {
              this.router.navigate(['/custom-studio/customize', request.id]);
            }
          } else {
            this.router.navigate(['/custom-studio/customize', request.id]);
          }
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/custom-studio/customize', request.id]);
        }
      });
    } else if (s === 'ReadyForGeneration' || s === 'Generating') {
      this.router.navigate(['/custom-studio/generating', request.id]);
    } else if (s === 'Generated') {
      this.router.navigate(['/custom-studio/results', request.id]);
    } else if (s === 'DesignSelected') {
      this.router.navigate(['/custom-studio/summary', request.id]);
    } else if (s === 'SellerMatched') {
      this.router.navigate(['/custom-studio/matching', request.id]);
    } else {
      // Load details to retrieve conversationId and navigate to chat
      this.loading.set(true);
      this.customStudioService.getCustomRequestDetails(request.id).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.success && res.data) {
            const convId = res.data.conversationId || res.data.projectWorkspace?.chatConversationId;
            if (convId) {
              this.router.navigate(['/chat', convId], { queryParams: { requestId: request.id } });
            } else {
              this.toastr.warning('No active conversation found for this request.');
            }
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.toastr.error('Failed to load request details.');
          console.error(err);
        }
      });
    }
  }

  trackByRequestId(index: number, item: CustomRequestSummaryDto): string {
    return item.id;
  }
}
