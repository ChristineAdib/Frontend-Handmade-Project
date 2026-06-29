import { Component, inject, ViewChild, ElementRef, AfterViewChecked, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/Services/auth';
import { MessageType } from '../../Models/MessageType';
import { LanguageService } from '../../../core/services/language.service';
import { ToastrService } from 'ngx-toastr';
import { parseUtcDate } from '../../../core/utils/date-utils';
import { ShopService } from '../../../shop feature/services/shop-service';
import { CreateSellerOfferCommand, CreateCustomServiceCommand, parseDesignSummary, DesignSummary } from '../../../custom-studio/models/custom-studio.models';
import { NotificationService } from '../../../Notifications/Services/notification.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements AfterViewChecked {
  protected chatService = inject(ChatService);
  private authService = inject(AuthService);
  protected langService = inject(LanguageService);
  private toastr = inject(ToastrService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  newMessage = signal<string>('');
  imageUrl = signal<string>('');
  isUploading = signal<boolean>(false);
  uploadError = signal<string>('');
  activeLightboxImage = signal<string | null>(null);
  showDetailedSpecs = signal<boolean>(false);
  
  private shouldScrollToBottom = true;

  currentUserId = computed(() => this.authService.getUser()?.userId || '');

  activeConversation = this.chatService.activeConversation;
  messages = this.chatService.activeMessages;
  
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);
  private notificationService = inject(NotificationService);
  customRequest = signal<any>(null);
  routeRequestId = signal<string | null>(null);

  isSeller = computed(() => this.currentUserId() === this.activeConversation()?.sellerId);
  isAdmin = computed(() => {
    const user = this.authService.getUser();
    return user?.roles?.includes('Admin') || false;
  });
  isSellerOrAdmin = computed(() => this.isSeller() || this.isAdmin());

  isWorkspaceCompleted = computed(() => {
    const req = this.customRequest();
    if (!req) return false;
    const statusNum = this.getStatusNumber(req.status);
    return statusNum === 14 || !!req.projectWorkspace?.isLocked;
  });
  isChatLocked = computed(() => {
    return false;
  });

  pendingOffer = computed(() => {
    const req = this.customRequest();
    if (!req || !req.customOffers || req.customOffers.length === 0) return null;
    const sorted = [...req.customOffers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0];
  });

  proposedService = computed(() => {
    return this.customRequest()?.customService || null;
  });

  customOffers = computed(() => {
    return this.customRequest()?.customOffers || [];
  });

  showOfferCenter = signal<boolean>(false);
  showCreateOfferModal = signal<boolean>(false);
  showOfferReviewStep = signal<boolean>(false);
  submittingOffer = signal<boolean>(false);
  serviceTitle = signal<string>('');
  offerPrice = signal<number | null>(null);
  offerDeliveryDays = signal<number | null>(null);
  offerRevisions = signal<number>(3);
  offerNotes = signal<string>('');
  offerOptionalNotes = signal<string>('');
  sellerShopId = signal<string>('');
  editingOfferId = signal<string | null>(null);
  expandedOfferId = signal<string | null>(null);

  // Regex pattern for Egyptian mobile numbers
  private readonly phoneRegex = /(?:\+?20|0020)?\s*0?1[0125](?:\s*[.\- ]?\s*\d){8}\b/i;

  // Regex pattern for URLs, links and social media links
  private readonly linkRegex = /\b(?:https?:\/\/|www\.)\S+|\b[a-zA-Z0-9.-]+\.(?:com|net|org|io|co|app|dev|me|shop|store|eg)\b(?:\/\S*)?|\b(?:facebook|instagram|tiktok|twitter|youtube|telegram|whatsapp|wa\.me|t\.me)\b(?:\/\S*)?/i;

  validationError = computed(() => {
    const c = this.activeConversation();
    if (!c) return '';

    // 1. Prevent Self-Messaging
    if (c.buyerId === this.currentUserId() && c.sellerId === this.currentUserId()) {
      return this.langService.translate('cannotSendToSelf');
    }

    const text = this.newMessage();
    if (!text) return '';

    // 2. Block Phone Numbers
    if (this.phoneRegex.test(text)) {
      return this.langService.translate('phoneNotAllowed');
    }

    // 3. Block URLs & Links
    if (this.linkRegex.test(text)) {
      return this.langService.translate('linksNotAllowed');
    }

    return '';
  });

  constructor() {
    // Scroll to bottom whenever messages change
    effect(() => {
      this.messages();
      this.shouldScrollToBottom = true;
    });

    // Sync route query parameter for active design context
    this.route.queryParams.subscribe(params => {
      this.routeRequestId.set(params['requestId'] || null);
    });

    // Listen to real-time notification to refresh active custom request details
    this.notificationService.notificationReceived$.subscribe((notif: any) => {
      const active = this.activeConversation();
      if (active && notif.referenceType === 'CustomRequest') {
        this.customStudioService.getCustomRequestByConversationId(active.id).subscribe({
          next: (resReq) => {
            if (resReq.success && resReq.data) {
              this.customRequest.set(resReq.data);
            }
          }
        });
      }
    });

    // Check if the current conversation is associated with a Custom Request
    effect(() => {
      const conv = this.activeConversation();
      const reqId = this.routeRequestId();
      
      // Clear old state immediately to avoid any stale data display
      this.customRequest.set(null);

      if (conv) {
        const targetRequestId = reqId || conv.customRequestId;
        if (targetRequestId) {
          this.customStudioService.getCustomRequestDetails(targetRequestId).subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.customRequest.set(res.data);
              }
            },
            error: () => {
              this.customRequest.set(null);
            }
          });
        } else {
          this.customStudioService.getCustomRequestByConversationId(conv.id).subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.customRequest.set(res.data);
              }
            },
            error: () => {
              this.customRequest.set(null);
            }
          });
        }
      }
    });
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

  getOtherParticipantName(): string {
    const c = this.activeConversation();
    if (!c) return '';
    return c.buyerId === this.currentUserId() ? c.sellerName : c.buyerName;
  }

  getOtherParticipantImage(): string | undefined {
    const c = this.activeConversation();
    if (!c) return undefined;
    return c.buyerId === this.currentUserId() ? c.sellerImage : c.buyerImage;
  }

  getOtherParticipantRole(): string {
    const c = this.activeConversation();
    if (!c) return '';
    return c.buyerId === this.currentUserId() 
      ? this.langService.translate('seller') 
      : this.langService.translate('buyer');
  }

  isSentByMe(senderId: string): boolean {
    return senderId === this.currentUserId();
  }

  isAiDesignCard(content: string | null | undefined): boolean {
    return !!content && content.startsWith('[AI_DESIGN_CARD]:');
  }

  parseAiDesignCard(content: string): any {
    if (!content) return null;
    try {
      const jsonStr = content.substring('[AI_DESIGN_CARD]:'.length);
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('Failed to parse AI design card:', err);
      return null;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.error('Scroll error:', err);
      }
    }
  }

  async send() {
    const c = this.activeConversation();
    if (!c) return;

    // Check validation error before sending
    const err = this.validationError();
    if (err) {
      this.toastr.error(err);
      return;
    }

    const text = this.newMessage().trim();
    const img = this.imageUrl().trim();

    if (!text && !img) return;

    try {
      if (img) {
        // Send as image message
        await this.chatService.sendMessage(c.id, text || 'Photo Attachment', MessageType.Image, img);
      } else {
        // Send as text message
        await this.chatService.sendMessage(c.id, text, MessageType.Text);
      }

      this.newMessage.set('');
      this.imageUrl.set('');
      this.shouldScrollToBottom = true;
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  async onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.isUploading.set(true);
    this.uploadError.set('');

    try {
      const uploadedUrl = await this.chatService.uploadImage(file);
      this.imageUrl.set(uploadedUrl);
    } catch (err: any) {
      this.uploadError.set(err.message || this.langService.translate('imageUploadFailed'));
    } finally {
      this.isUploading.set(false);
      element.value = '';
    }
  }

  clearUploadedImage(event: Event) {
    event.stopPropagation();
    this.imageUrl.set('');
    this.uploadError.set('');
  }

  formatMessageTime(timeStr: string): string {
    const date = parseUtcDate(timeStr);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Africa/Cairo'
    });
  }

  openLightbox(url: string): void {
    this.activeLightboxImage.set(url);
  }

  closeLightbox(): void {
    this.activeLightboxImage.set(null);
  }

  viewOfferReview(requestId: string): void {
    this.router.navigate(['/custom-studio/offer-review', requestId]);
  }

  viewWorkspace(requestId: string): void {
    this.router.navigate(['/custom-studio/workspace', requestId]);
  }

  navigateToCheckout(requestId: string): void {
    this.router.navigate(['/checkout'], { queryParams: { requestId } });
  }

  toggleOfferCenter(): void {
    this.showOfferCenter.set(!this.showOfferCenter());
  }

  openCreateOfferModal() {
    const req = this.customRequest();

    this.shopService.getMyShop().subscribe({
      next: (shop) => {
        if (shop && shop.id) {
          this.sellerShopId.set(shop.id);
          this.editingOfferId.set(null); // Clear edit mode
          this.offerPrice.set(null);
          this.offerDeliveryDays.set(null);
          this.offerNotes.set('');
          this.offerOptionalNotes.set('');
          this.showCreateOfferModal.set(true);
          this.showOfferReviewStep.set(false);
          const req = this.customRequest();
          if (req) {
            this.offerPrice.set(req.targetBudget || null);
            // Autocomplete service title
            const size = req.customConfiguration?.size || '20cm';
            const theme = req.customConfiguration?.bodyType || 'Chibi';
            this.serviceTitle.set(`Custom Crochet Doll - ${size} ${theme}`);
          }
        } else {
          this.toastr.error('You must have an active seller shop to create a custom offer.');
        }
      },
      error: (err) => {
        console.error('Failed to get my shop:', err);
        this.toastr.error('Failed to retrieve your shop details.');
      }
    });
  }

  editOffer(offer: any) {
    this.editingOfferId.set(offer.id);
    this.offerPrice.set(offer.price);
    this.offerDeliveryDays.set(offer.deliveryTimeDays);
    this.offerRevisions.set(offer.revisionsAllowed);
    
    // Attempt to split description and optional notes if they exist
    const notesStr = offer.notes || '';
    const splitIndex = notesStr.indexOf("\n\nOptional Notes: ");
    if (splitIndex !== -1) {
      this.offerNotes.set(notesStr.substring(0, splitIndex));
      this.offerOptionalNotes.set(notesStr.substring(splitIndex + "\n\nOptional Notes: ".length));
    } else {
      this.offerNotes.set(notesStr);
      this.offerOptionalNotes.set('');
    }

    this.showCreateOfferModal.set(true);
    this.showOfferReviewStep.set(false);
  }

  reviewCustomOffer() {
    if (!this.validateOfferDraft()) return;
    this.showOfferReviewStep.set(true);
  }

  editOfferDraft() {
    this.showOfferReviewStep.set(false);
  }

  submitCustomOffer(status: 'Draft' | 'Sent') {
    const req = this.customRequest();
    if (!req) return;

    if (!this.validateOfferDraft()) return;

    const price = this.offerPrice();
    const deliveryDays = this.offerDeliveryDays();
    const notes = this.offerNotes();
    const optionalNotes = this.offerOptionalNotes();
    if (!price || !deliveryDays) return;

    // Concatenate description and optional notes for saving
    let combinedNotes = notes.trim();
    if (optionalNotes && optionalNotes.trim()) {
      combinedNotes += "\n\nOptional Notes: " + optionalNotes.trim();
    }

    const command: CreateSellerOfferCommand = {
      requestId: req.id,
      shopId: this.sellerShopId(),
      price: price,
      deliveryTimeDays: deliveryDays,
      revisionsAllowed: this.offerRevisions() || 1,
      notes: combinedNotes,
      attachments: [],
      status: status,
      offerId: this.editingOfferId() || undefined
    };

    this.submittingOffer.set(true);
    this.customStudioService.createSellerOffer(req.id, command).subscribe({
      next: (res) => {
        this.submittingOffer.set(false);
        if (res.success) {
          this.toastr.success(`Custom offer ${status === 'Draft' ? 'draft saved' : 'sent'} successfully!`);
          this.showCreateOfferModal.set(false);
          this.showOfferReviewStep.set(false);
          // Reset form fields
          this.offerPrice.set(null);
          this.offerDeliveryDays.set(null);
          this.offerNotes.set('');
          this.offerOptionalNotes.set('');
          this.editingOfferId.set(null);
          
          // Refresh the custom request details
          this.customStudioService.getCustomRequestByConversationId(this.activeConversation()!.id).subscribe({
            next: (resReq) => {
              if (resReq.success && resReq.data) {
                this.customRequest.set(resReq.data);
              }
            }
          });
        } else {
          this.toastr.error(res.message || 'Failed to propose custom offer.');
        }
      },
      error: (err) => {
        this.submittingOffer.set(false);
        console.error('Error creating custom offer:', err);
        this.toastr.error('An error occurred while creating the offer.');
      }
    });
  }

  acceptCustomOffer(requestId: string, offerId: string) {
    this.toastr.info('Accepting offer...');
    this.customStudioService.acceptOffer(requestId, offerId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Offer accepted! Redirecting to checkout...');
          // Refresh request details
          this.customStudioService.getCustomRequestByConversationId(this.activeConversation()!.id).subscribe({
            next: (resReq) => {
              if (resReq.success && resReq.data) {
                this.customRequest.set(resReq.data);
              }
            }
          });
          this.router.navigate(['/checkout'], { queryParams: { requestId: requestId } });
        } else {
          this.toastr.error(res.message || 'Failed to accept offer.');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to accept offer.');
      }
    });
  }

  rejectCustomOffer(requestId: string, offerId: string) {
    if (confirm('Are you sure you want to reject this offer?')) {
      this.toastr.info('Rejecting offer...');
      this.customStudioService.rejectOffer(requestId, offerId).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Offer rejected successfully.');
            // Refresh request details
            this.customStudioService.getCustomRequestByConversationId(this.activeConversation()!.id).subscribe({
              next: (resReq) => {
                if (resReq.success && resReq.data) {
                  this.customRequest.set(resReq.data);
                }
              }
            });
          } else {
            this.toastr.error(res.message || 'Failed to reject offer.');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to reject offer.');
        }
      });
    }
  }


  toggleOfferDetails(offerId: string) {
    if (this.expandedOfferId() === offerId) {
      this.expandedOfferId.set(null);
    } else {
      this.expandedOfferId.set(offerId);
    }
  }

  completePayment(requestId: string) {
    const req = this.customRequest();
    const orderId = req?.projectWorkspace?.orderId;
    const statusNum = this.getStatusNumber(req?.status);
    if (statusNum === 11) {
      if (orderId) {
        this.router.navigate(['/payment', orderId]);
      } else {
        this.router.navigate(['/custom-studio/offer-review', requestId]);
      }
    } else {
      this.router.navigate(['/custom-studio/offer-review', requestId]);
    }
  }

  getStatusNumber(status: any): number {
    if (status === null || status === undefined) return 0;
    if (typeof status === 'number') return status;
    
    // Convert string representations to numbers
    const statusMap: { [key: string]: number } = {
      'Draft': 1,
      'Configuring': 2,
      'ReadyForGeneration': 3,
      'Generating': 4,
      'Generated': 5,
      'DesignSelected': 6,
      'SellerMatched': 7,
      'Negotiation': 8,
      'OfferSent': 9,
      'OfferAccepted': 10,
      'PaymentPending': 11,
      'Paid': 12,
      'InProgress': 13,
      'Completed': 14,
      'Cancelled': 15,
      'Rejected': 16
    };
    return statusMap[status] || parseInt(status, 10) || 0;
  }

  getRequestStatusLabel(status: any): string {
    const statusNum = this.getStatusNumber(status);
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
      12: 'Paid (Deposit)',
      13: 'In Crafting Progress',
      14: 'Completed / Delivered',
      15: 'Cancelled',
      16: 'Rejected'
    };
    return statusMap[statusNum] || 'Unknown';
  }

  getSelectedDesignImageUrl(): string | null {
    const req = this.customRequest();
    if (!req) return null;
    if (req.selectedDesign?.imageUrl) return req.selectedDesign.imageUrl;
    
    // Fallback search in generatedDesigns list
    const found = req.generatedDesigns?.find((d: any) => d.id === req.selectedDesignId);
    return found?.imageUrl || null;
  }

  getSelectedDesign(): any {
    const req = this.customRequest();
    if (!req) return null;
    return req.selectedDesign || req.generatedDesigns?.find((d: any) => d.id === req.selectedDesignId) || null;
  }

  getDesignSummary(): DesignSummary {
    const design = this.getSelectedDesign();
    const summary = parseDesignSummary(design);
    if (Object.keys(summary).length > 0) return summary;

    const raw = this.customRequest()?.customConfiguration?.configurationDataJson;
    if (!raw) return {};
    try {
      const cfg = JSON.parse(raw);
      const hair = cfg.Hair || cfg.hair || {};
      const outfit = cfg.Outfit || cfg.outfit || {};
      const accessories = cfg.Accessories || cfg.accessories || {};
      const personalization = cfg.Personalization || cfg.personalization || {};
      return {
        gender: cfg.Gender || cfg.gender,
        height: cfg.Size || cfg.size,
        skinTone: cfg.SkinTone || cfg.skinTone,
        hairStyle: hair.Style || cfg.hairStyle,
        hairColor: hair.Color || cfg.hairColor,
        outfit: outfit.Description || cfg.outfitStyle,
        accessories: accessories.Description || (Array.isArray(cfg.accessories) ? cfg.accessories.join(', ') : cfg.accessories),
        personalization: personalization.LabelText || cfg.personalizationName || cfg.AdditionalNotes || cfg.personalizationMessage,
        referenceImage: cfg.ReferenceImageUrl || this.customRequest()?.referenceImageUrl
      };
    } catch {
      return {};
    }
  }

  downloadSelectedDesignImage() {
    const url = this.getSelectedDesignImageUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `doll-design-${this.customRequest()?.id}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getSummaryPairs(): { label: string; value: string }[] {
    const s = this.getDesignSummary();
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

  private validateOfferDraft(): boolean {
    const price = this.offerPrice();
    const deliveryDays = this.offerDeliveryDays();
    const notes = this.offerNotes();
    const title = this.serviceTitle();

    if (!title || !title.trim()) {
      this.toastr.warning('Please enter a service title.');
      return false;
    }
    if (!price || price <= 0) {
      this.toastr.warning('Please enter a valid price.');
      return false;
    }
    if (!deliveryDays || deliveryDays <= 0) {
      this.toastr.warning('Please enter a valid delivery time.');
      return false;
    }
    if (!notes || !notes.trim()) {
      this.toastr.warning('Please enter some notes for the service.');
      return false;
    }

    return true;
  }

  submittingAction = signal<boolean>(false);

  approveService(): void {
    const service = this.proposedService();
    if (!service) return;

    this.submittingAction.set(true);
    this.customStudioService.approveCustomService(service.id).subscribe({
      next: (res) => {
        this.submittingAction.set(false);
        if (res.success) {
          this.toastr.success('Custom service approved! Redirecting to checkout...');
          this.router.navigate(['/checkout'], { queryParams: { requestId: this.customRequest()?.id } });
        } else {
          this.toastr.error(res.message || 'Failed to approve custom service');
        }
      },
      error: (err) => {
        this.submittingAction.set(false);
        this.toastr.error('Failed to approve custom service');
        console.error(err);
      }
    });
  }

  rejectService(): void {
    const service = this.proposedService();
    if (!service) return;

    if (confirm('Are you sure you want to reject this custom service proposal?')) {
      this.submittingAction.set(true);
      this.customStudioService.rejectCustomService(service.id).subscribe({
        next: (res) => {
          this.submittingAction.set(false);
          if (res.success) {
            this.toastr.info('Custom service proposal rejected.');
            // Reload request details to update state
            this.customStudioService.getCustomRequestByConversationId(this.activeConversation()!.id).subscribe({
              next: (resReq) => {
                if (resReq.success) {
                  this.customRequest.set(resReq.data);
                }
              }
            });
          } else {
            this.toastr.error(res.message || 'Failed to reject custom service proposal');
          }
        },
        error: (err) => {
          this.submittingAction.set(false);
          this.toastr.error('Failed to reject custom service proposal');
          console.error(err);
        }
      });
    }
  }
}
