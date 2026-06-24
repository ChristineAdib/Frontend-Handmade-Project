import { Component, inject, ViewChild, ElementRef, AfterViewChecked, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/Services/auth';
import { MessageType } from '../../Models/MessageType';
import { LanguageService } from '../../../core/services/language.service';
import { ToastrService } from 'ngx-toastr';
import { parseUtcDate } from '../../../core/utils/date-utils';

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
  
  private shouldScrollToBottom = true;

  currentUserId = computed(() => this.authService.getUser()?.userId || '');

  activeConversation = this.chatService.activeConversation;
  messages = this.chatService.activeMessages;
  
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  customRequest = signal<any>(null);

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

    // Check if the current conversation is associated with a Custom Request
    effect(() => {
      const conv = this.activeConversation();
      if (conv) {
        this.customStudioService.getCustomRequestByConversationId(conv.id).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.customRequest.set(res.data);
            } else {
              this.customRequest.set(null);
            }
          },
          error: () => {
            this.customRequest.set(null);
          }
        });
      } else {
        this.customRequest.set(null);
      }
    });
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

  getRequestStatusLabel(status: number): string {
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
    return statusMap[status] || 'Unknown';
  }
}
