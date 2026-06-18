import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { Conversation } from '../Models/conversation.model';
import { Message } from '../Models/message.model';
import { MessageType } from '../Models/MessageType';
import { ApiResponse } from '../../auth/models/api-response.model';
import { environment } from '../../../environments/environment';
import { SignalrService } from './signalr.service';
import { AuthService } from '../../auth/Services/auth';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly signalrService = inject(SignalrService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  private readonly apiUrl = `${environment.apiUrl}/api/chat`;

  // Application state using Signals
  readonly conversations = signal<Conversation[]>([]);
  readonly activeMessages = signal<Message[]>([]);
  readonly activeConversation = signal<Conversation | null>(null);

  // Computed signal for total unread messages
  readonly totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );

  private subscriptions: Subscription[] = [];

  constructor() {
    this.registerSignalRListeners();
  }

  /**
   * Starts real-time SignalR connection if the user is authenticated.
   */
  async initializeRealTime(): Promise<void> {
    const token = this.authService.getToken();
    if (token) {
      try {
        await this.signalrService.startConnection(token);
        console.log('Real-time chat initialized.');
      } catch (err) {
        console.error('Failed to initialize SignalR:', err);
      }
    }
  }

  /**
   * Stops real-time connection.
   */
  async disconnectRealTime(): Promise<void> {
    await this.signalrService.stopConnection();
  }

  /**
   * Subscribe to SignalR events and update local state instantly.
   */
  private registerSignalRListeners(): void {
    // 1) Incoming message received
    this.subscriptions.push(
      this.signalrService.messageReceived$.subscribe((message: Message) => {
        const active = this.activeConversation();
        
        // If message is for the currently open conversation, append to active messages
        if (active && active.id === message.conversationId) {
          this.activeMessages.update((prev) => {
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
          
          // Auto read it
          this.markAsRead(active.id);
        }

        // Update last message and unread count in conversation list
        this.conversations.update((prev) =>
          prev.map((c) => {
            if (c.id === message.conversationId) {
              const isActive = active?.id === c.id;
              return {
                ...c,
                lastMessage: message,
                unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
              };
            }
            return c;
          })
        );
      })
    );

    // 2) Conversation started remotely
    this.subscriptions.push(
      this.signalrService.conversationStarted$.subscribe((conversation: Conversation) => {
        const exists = this.conversations().some((c) => c.id === conversation.id);
        if (!exists) {
          this.conversations.update((prev) => [conversation, ...prev]);
        }
      })
    );

    // 3) Messages read event
    this.subscriptions.push(
      this.signalrService.messagesRead$.subscribe(({ conversationId }) => {
        const active = this.activeConversation();
        if (active && active.id === conversationId) {
          this.activeMessages.update((prev) =>
            prev.map((m) => ({ ...m, isRead: true }))
          );
        }
      })
    );
  }

  /**
   * Loads all conversations from backend.
   */
  async loadConversations(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}/conversations`)
      );
      if (res.success && res.data) {
        // Sort conversations: newest last message first
        const sorted = [...res.data].sort((a, b) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
          const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        this.conversations.set(sorted);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  /**
   * Loads messages for a specific conversation.
   */
  async loadMessages(conversationId: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/${conversationId}/messages`)
      );
      if (res.success && res.data) {
        this.activeMessages.set(res.data);
      }
    } catch (err) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, err);
    }
  }

  /**
   * Starts a new conversation with a seller.
   */
  async startConversation(sellerId: string): Promise<Conversation> {
    const currentUserId = this.authService.getUser()?.userId;
    if (currentUserId === sellerId) {
      this.toastr.error('You cannot send messages to yourself.');
      throw new Error('You cannot send messages to yourself.');
    }
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<Conversation>>(`${this.apiUrl}/start`, { sellerId })
      );
      if (res.success && res.data) {
        const exists = this.conversations().some((c) => c.id === res.data.id);
        if (!exists) {
          this.conversations.update((prev) => [res.data, ...prev]);
        }
        return res.data;
      }
      throw new Error(res.message || 'Failed to start conversation');
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      const errMsg = err.error?.message || err.message || 'Failed to start conversation';
      this.toastr.error(errMsg);
      throw err;
    }
  }

  /**
   * Starts or gets a conversation by shopId.
   */
  async startConversationByShop(shopId: string): Promise<Conversation> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<Conversation>>(`${this.apiUrl}/start-by-shop/${shopId}`, {})
      );
      if (res.success && res.data) {
        const exists = this.conversations().some((c) => c.id === res.data.id);
        if (!exists) {
          this.conversations.update((prev) => [res.data, ...prev]);
        }
        return res.data;
      }
      throw new Error(res.message || 'Failed to start conversation by shop');
    } catch (err: any) {
      console.error('Failed to start conversation by shop:', err);
      const errMsg = err.error?.message || err.message || 'Failed to start conversation by shop';
      this.toastr.error(errMsg);
      throw err;
    }
  }

  /**
   * Sends a message within a conversation.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = MessageType.Text,
    imageUrl: string | null = null
  ): Promise<void> {
    try {
      const body = { conversationId, content, type, imageUrl };
      const res = await firstValueFrom(
        this.http.post<ApiResponse<Message>>(`${this.apiUrl}/send`, body)
      );

      if (res.success && res.data) {
        const newMessage = res.data;
        // Append locally
        this.activeMessages.update((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Update last message in conversation list
        this.conversations.update((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, lastMessage: newMessage } : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }

  /**
   * Marks a conversation's messages as read.
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/${conversationId}/read`, {})
      );
      
      // Update unread status locally
      this.conversations.update((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error(`Failed to mark conversation ${conversationId} as read:`, err);
    }
  }

  /**
   * Opens conversation and retrieves its messages.
   */
  async openConversation(conversation: Conversation): Promise<void> {
    this.activeConversation.set(conversation);
    await this.loadMessages(conversation.id);
    if (conversation.unreadCount > 0) {
      await this.markAsRead(conversation.id);
    }
  }

  /**
   * Uploads an image file to the chat upload endpoint.
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await firstValueFrom(
        this.http.post<ApiResponse<string>>(`${this.apiUrl}/upload`, formData)
      );

      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to upload image');
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      throw err;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.disconnectRealTime();
  }
}