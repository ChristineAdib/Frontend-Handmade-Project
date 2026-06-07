import { Component, inject, ViewChild, ElementRef, AfterViewChecked, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';
import { AuthService } from '../../../auth/Services/auth';
import { MessageType } from '../../Models/MessageType';

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

  constructor() {
    // Scroll to bottom whenever messages change
    effect(() => {
      this.messages();
      this.shouldScrollToBottom = true;
    });
  }

  getOtherParticipantName(): string {
    const c = this.activeConversation();
    if (!c) return '';
    return c.buyerId === this.currentUserId() ? c.sellerName : c.buyerName;
  }

  getOtherParticipantRole(): string {
    const c = this.activeConversation();
    if (!c) return '';
    return c.buyerId === this.currentUserId() ? 'Seller' : 'Buyer';
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
      this.uploadError.set(err.message || 'Image upload failed. Please try again.');
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
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  openLightbox(url: string): void {
    this.activeLightboxImage.set(url);
  }

  closeLightbox(): void {
    this.activeLightboxImage.set(null);
  }
}
