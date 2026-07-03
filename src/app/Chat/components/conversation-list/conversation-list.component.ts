import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Conversation } from '../../Models/conversation.model';
import { ChatService } from '../../Services/chat.service';
import { AuthService } from '../../../auth/Services/auth';
import { MessageType } from '../../Models/MessageType';
import { LanguageService } from '../../../core/services/language.service';
import { parseUtcDate } from '../../../core/utils/date-utils';
import { CustomStudioService } from '../../../custom-studio/services/custom-studio.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent {
  protected chatService = inject(ChatService);
  private authService = inject(AuthService);
  protected langService = inject(LanguageService);
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

  searchQuery = signal<string>('');

  currentUserId = computed(() => this.authService.getUser()?.userId || '');

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.chatService.conversations();
    const currentId = this.currentUserId();

    if (!query) return list;

    return list.filter(c => {
      const otherName = c.buyerId === currentId ? c.sellerName : c.buyerName;
      return otherName.toLowerCase().includes(query);
    });
  });

  getOtherParticipantName(c: Conversation): string {
    return c.buyerId === this.currentUserId() ? c.sellerName : c.buyerName;
  }

  getOtherParticipantImage(c: Conversation): string | undefined {
    return c.buyerId === this.currentUserId() ? c.sellerImage : c.buyerImage;
  }

  getOtherParticipantRole(c: Conversation): string {
    return c.buyerId === this.currentUserId() ? 'Seller' : 'Buyer';
  }

  getLastMessageText(c: Conversation): string {
    if (!c.lastMessage) return this.langService.translate('noMessages');
    if (c.lastMessage.type === MessageType.Image) return this.langService.translate('photoAttachment');
    return c.lastMessage.content;
  }

  getLastMessageTime(c: Conversation): string {
    const msgDate = c.lastMessage ? parseUtcDate(c.lastMessage.createdAt) : parseUtcDate(c.createdAt);
    
    const getEgyptDateString = (d: Date) => {
      return d.toLocaleDateString('en-US', { timeZone: 'Africa/Cairo' });
    };
    
    const now = new Date();
    const msgDateStr = getEgyptDateString(msgDate);
    const nowStr = getEgyptDateString(now);
    
    // If today, show time
    if (msgDateStr === nowStr) {
      return msgDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Africa/Cairo'
      });
    }
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getEgyptDateString(yesterday);
    if (msgDateStr === yesterdayStr) {
      return this.langService.translate('yesterday');
    }
    // Otherwise show date
    return msgDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    });
  }

  selectConversation(conversation: Conversation) {
    this.chatService.openConversation(conversation);
    this.router.navigate(['/chat', conversation.id]);
  }
}
