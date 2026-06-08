import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../Models/conversation.model';
import { ChatService } from '../../Services/chat.service';
import { AuthService } from '../../../auth/Services/auth';
import { MessageType } from '../../Models/MessageType';

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
    if (!c.lastMessage) return 'No messages yet';
    if (c.lastMessage.type === MessageType.Image) return '📷 Photo';
    return c.lastMessage.content;
  }

  getLastMessageTime(c: Conversation): string {
    const msgDate = c.lastMessage ? new Date(c.lastMessage.createdAt) : new Date(c.createdAt);
    const now = new Date();
    
    // If today, show time
    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise show date
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  selectConversation(conversation: Conversation) {
    this.chatService.openConversation(conversation);
  }
}
