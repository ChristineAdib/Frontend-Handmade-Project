import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ChatService } from '../Services/chat.service';
import { AuthService } from '../../auth/Services/auth';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ConversationListComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  protected chatService = inject(ChatService);
  private authService = inject(AuthService);
  protected langService = inject(LanguageService);
  private route = inject(ActivatedRoute);

  async ngOnInit(): Promise<void> {
    // Load existing chat history from server
    await this.chatService.loadConversations();
    // Verify WebSocket/SignalR connection is running
    await this.chatService.initializeRealTime();

    // Check if there is a parameter in the route (can be conversationId or shopId)
    const paramId = this.route.snapshot.paramMap.get('shopId');
    if (paramId) {
      const existingConversation = this.chatService.conversations().find(c => c.id === paramId);
      if (existingConversation) {
        await this.chatService.openConversation(existingConversation);
      } else {
        try {
          const conversation = await this.chatService.startConversationByShop(paramId);
          await this.chatService.openConversation(conversation);
        } catch (err) {
          console.error('Failed to auto-start conversation by parameter ID:', err);
        }
      }
    }
  }

  ngOnDestroy(): void {
    // Note: Do NOT disconnect here so that background notifications 
    // and live unread counts in the header navbar continue to update.
  }
}
