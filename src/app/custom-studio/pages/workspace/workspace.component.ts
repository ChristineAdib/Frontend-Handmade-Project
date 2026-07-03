import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ProjectWorkspaceDto, CustomRequestDetailDto, DesignSummary } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/Services/auth';
import { ChatService } from '../../../Chat/Services/chat.service';
import { ChatWindowComponent } from '../../../Chat/components/chat-window/chat-window.component';
import { NotificationService } from '../../../Notifications/Services/notification.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatWindowComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);
  private notifSub?: Subscription;
  activeTab = signal<'timeline' | 'chat'>('timeline');
  chatReady = signal<boolean>(false);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  workspace = signal<ProjectWorkspaceDto | null>(null);
  loading = signal<boolean>(true);
  updatingProgress = signal<boolean>(false);
  uploadingPhoto = signal<boolean>(false);

  currentUserId = computed(() => this.authService.getUser()?.userId || '');
  isSeller = computed(() => {
    const details = this.requestDetails();
    return details !== null && this.currentUserId() !== details.buyerId;
  });

  selectedDesign = computed(() => this.requestDetails()?.selectedDesign || null);

  designSummary = computed<DesignSummary>(() => {
    const design = this.selectedDesign();
    if (!design || !design.designSummaryJson) {
      return {};
    }
    try {
      return JSON.parse(design.designSummaryJson);
    } catch (e) {
      console.error('Failed to parse designSummaryJson', e);
      return {};
    }
  });

  selectedOffer = computed(() =>
    this.requestDetails()?.customOffers?.find(o => o.id === this.workspace()?.selectedOfferId) || null
  );

  customService = computed(() => this.requestDetails()?.customService || null);

  isCompleted = computed(() =>
    this.workspace()?.status === 'Completed'
  );

  activeReferenceImage = signal<string | null>(null);

  orderNumber = computed(() => {
    const w = this.workspace();
    if (!w || !w.orderId) return 'N/A';
    return w.orderId.length > 8 ? w.orderId.substring(0, 8).toUpperCase() : w.orderId;
  });

  remainingDays = computed(() => {
    const service = this.customService();
    const details = this.requestDetails();
    if (!service || !details) return null;
    
    const startDateStr = details.createdAt;
    if (!startDateStr) return service.estimatedDeliveryDays;
    
    const start = new Date(startDateStr);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    
    const remaining = service.estimatedDeliveryDays - elapsedDays;
    return remaining > 0 ? remaining : 0;
  });

  estimatedDeliveryDate = computed(() => {
    const service = this.customService();
    const details = this.requestDetails();
    if (!service || !details) return null;
    const date = new Date(details.createdAt);
    date.setDate(date.getDate() + service.estimatedDeliveryDays);
    return date;
  });

  sortedTimelineEntries = computed(() => {
    const entries = this.workspace()?.timelineEntries || [];
    const stepOrder = [
      'Offer Approved',
      'Payment Completed',
      'Workspace Created',
      'Materials Purchased',
      'Crochet Started',
      'Half Finished',
      'Ready For Review',
      'Completed',
      'Delivered'
    ];
    return [...entries].sort((a, b) => {
      const idxA = stepOrder.indexOf(a.title);
      const idxB = stepOrder.indexOf(b.title);
      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  });

  progressPercent = computed(() => {
    const entries = this.sortedTimelineEntries();
    if (entries.length === 0) return 0;
    const completed = entries.filter(e => e.isCompleted).length;
    return Math.round((completed / entries.length) * 100);
  });

  summaryBadges = computed(() => {
    const s = this.designSummary();
    const list = [];
    if (s.gender) list.push({ label: 'Gender', value: s.gender });
    if (s.height) list.push({ label: 'Height', value: s.height });
    if (s.skinTone) list.push({ label: 'Skin', value: s.skinTone });
    if (s.hairStyle || s.hairColor) list.push({ label: 'Hair', value: [s.hairStyle, s.hairColor].filter(Boolean).join(' ') });
    if (s.outfit) list.push({ label: 'Outfit', value: s.outfit });
    if (s.accessories) list.push({ label: 'Acc', value: s.accessories });
    if (s.personalization) list.push({ label: 'Msg', value: s.personalization });
    return list;
  });

  // List of active milestones in crafting
  milestones = [
    { name: 'Offer Approved', desc: 'Buyer accepted the custom offer.' },
    { name: 'Payment Completed', desc: 'Deposit payment secured in escrow.' },
    { name: 'Workspace Created', desc: 'Artisan workspace opened.' },
    { name: 'Materials Purchased', desc: 'Yarn, stuffing, and accessories sourced.' },
    { name: 'Crochet Started', desc: 'Doll assembly and stitching started.' },
    { name: 'Half Finished', desc: 'Main body and structural crochet completed.' },
    { name: 'Ready For Review', desc: 'Artisan uploaded progress photos for review.' },
    { name: 'Delivered', desc: 'Doll shipped with tracking details.' },
    { name: 'Completed', desc: 'Buyer approved and funds released.' }
  ];

  isMilestoneCompleted(index: number): boolean {
    const w = this.workspace();
    if (!w) return false;
    if (index <= 2) return true;
    switch (index) {
      case 3: return w.milestoneStep >= 1;
      case 4: return w.milestoneStep >= 2;
      case 5: return w.milestoneStep >= 4;
      case 6: return w.milestoneStep >= 5;
      case 7: return w.milestoneStep >= 6;
      case 8: return w.milestoneStep >= 7;
      default: return false;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadWorkspace(id);
      this.setupNotificationListener();
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

  private setupNotificationListener(): void {
    this.notifSub = this.notificationService.notificationReceived$.subscribe({
      next: (notif) => {
        if (notif.referenceType === 'CustomRequest' && notif.referenceId === this.requestId()) {
          console.log('Real-time workspace update received:', notif);
          this.loadWorkspace(this.requestId(), false);
        }
      }
    });
  }

  loadWorkspace(id: string, showSpinner = true): void {
    if (showSpinner) {
      this.loading.set(true);
    }
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: async (res) => {
        if (res.success && res.data) {
          const currentUser = this.authService.getUser();
          const currentUserId = currentUser?.userId || '';
          const userRoles = currentUser?.roles || [];
          const isAdmin = userRoles.includes('Admin');

          if ((res.data.buyerId === currentUserId || !res.data.projectWorkspace) && !isAdmin) {
            this.toastr.error('Access denied. Only the assigned Seller can access this workspace.');
            this.router.navigate(['/custom-studio']);
            return;
          }

          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);

          // Initialize isolated chat using workspaceChatConvId
          const workspace = res.data.projectWorkspace;
          const workspaceChatConvId = workspace?.chatConversationId;
          if (workspaceChatConvId) {
            try {
              await this.chatService.initializeRealTime();
              await this.chatService.loadConversations();
              
              let conversation = this.chatService.conversations().find(c => c.id === workspaceChatConvId);
              if (!conversation) {
                conversation = {
                  id: workspaceChatConvId,
                  buyerId: res.data.buyerId,
                  buyerName: res.data.buyerName,
                  buyerImage: '',
                  sellerId: res.data.selectedSellerId || '',
                  sellerName: res.data.selectedSellerName || '',
                  sellerImage: '',
                  createdAt: new Date().toISOString(),
                  unreadCount: 0,
                  lastMessage: null as any
                };
              }
              
              await this.chatService.openConversation(conversation);
              this.chatReady.set(true);
            } catch (err) {
              console.error('Failed to load isolated workspace chat:', err);
            }
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load project workspace details');
        console.error(err);
      }
    });
  }

  getStatusClass(step: number): string {
    const w = this.workspace();
    if (!w) return 'pending';
    
    if (w.milestoneStep > step) {
      return 'completed';
    } else if (w.milestoneStep === step) {
      return 'active';
    }
    return 'pending';
  }

  incrementMilestone(): void {
    const w = this.workspace();
    if (!w) return;
    this.updatingProgress.set(true);
    this.customStudioService.updateWorkspaceProgress(this.requestId(), w.milestoneStep + 1).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Crafting milestone updated successfully');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to update crafting milestone');
        console.error(err);
      }
    });
  }

  shipProject(trackingNumber: string): void {
    if (!trackingNumber.trim()) {
      this.toastr.error('Please enter a tracking number.');
      return;
    }
    this.updatingProgress.set(true);
    this.customStudioService.updateWorkspaceProgress(this.requestId(), 6, trackingNumber).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Project marked as Shipped!');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to register shipping details');
        console.error(err);
      }
    });
  }

  uploadPhoto(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.uploadingPhoto.set(true);
    this.customStudioService.uploadWorkspacePhoto(this.requestId(), file).subscribe({
      next: (res) => {
        this.uploadingPhoto.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Workspace progress photo uploaded!');
        }
        element.value = '';
      },
      error: (err) => {
        this.uploadingPhoto.set(false);
        this.toastr.error('Failed to upload workspace photo');
        console.error(err);
        element.value = '';
      }
    });
  }

  confirmDelivery(): void {
    this.updatingProgress.set(true);
    this.customStudioService.confirmWorkspaceDelivery(this.requestId()).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Delivery confirmed! Custom order successfully completed.');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to confirm delivery');
        console.error(err);
      }
    });
  }

  resolveImageUrl(url: string | undefined | null): string {
    if (!url) return '';
    return this.customStudioService.resolveImageUrl(url);
  }

  openReferenceImage(): void {
    const url = this.selectedDesign()?.imageUrl || this.designSummary().designImage || this.requestDetails()?.referenceImageUrl;
    if (url) {
      this.activeReferenceImage.set(this.resolveImageUrl(url));
    }
  }

  closeReferenceImage(): void {
    this.activeReferenceImage.set(null);
  }
}
