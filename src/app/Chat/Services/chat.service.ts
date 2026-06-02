import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalr from '@microsoft/signalr';
import { firstValueFrom } from 'rxjs';
import {ConversationItem} from '../Models/ConversationItem';
import {MessageType} from '../Models/MessageType';
import {MessageItem} from '../Models/MessageItem';
import {SendMessageRequest} from '../Models/SendMessageRequest';
import {StartConversationRequest} from '../Models/StartConversationRequest';
import { ApiResponse } from '../../auth/models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/chat`;
  private readonly hubUrl = `${environment.apiUrl}/hubs/chat`;

  readonly conversations     = signal<ConversationItem[]>([]);
  readonly activeMessages    = signal<MessageItem[]>([]);
  readonly activeConversation = signal<ConversationItem | null>(null);
  readonly isConnected       = signal<boolean>(false);

  readonly totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + c.unreadCount, 0)
  );

  private hubConnection: signalr.HubConnection | null = null;

  async startConnection(token: string): Promise<void> {
    this.hubConnection = new signalr.HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalr.LogLevel.Warning)
      .build();

    this.registerHandlers();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
    } catch (err) {
      console.error('Chat hub connection failed:', err);
    }
  }

  async stopConnection(): Promise<void> {
    await this.hubConnection?.stop();
    this.isConnected.set(false);
  }

  private registerHandlers(): void {
    this.hubConnection!.on('ReceiveMessage', (message: MessageItem) => {
      if (this.activeConversation()?.id === message.conversationId) {
        this.activeMessages.update(prev => [...prev, message]);
      }

      this.conversations.update(prev =>
        prev.map(c => c.id === message.conversationId
          ? {
              ...c,
              lastMessage: message,
              unreadCount: this.activeConversation()?.id === c.id
                ? 0
                : c.unreadCount + 1
            }
          : c
        )
      );
    });

    this.hubConnection!.on('ConversationStarted', (conversation: ConversationItem) => {
      this.conversations.update(prev => [conversation, ...prev]);
    });

    this.hubConnection!.on('MessagesRead', (conversationId: string) => {
      if (this.activeConversation()?.id === conversationId) {
        this.activeMessages.update(prev =>
          prev.map(m => ({ ...m, isRead: true }))
        );
      }
    });

    this.hubConnection!.onreconnected(() => this.isConnected.set(true));
    this.hubConnection!.onreconnecting(() => this.isConnected.set(false));
  }

  async loadConversations(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<ConversationItem[]>>(`${this.apiUrl}/conversations`)
    );
    if (res.success) this.conversations.set(res.data);
  }

  async loadMessages(conversationId: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<MessageItem[]>>(
        `${this.apiUrl}/${conversationId}/messages`
      )
    );
    if (res.success) this.activeMessages.set(res.data);
  }

  async startConversation(sellerId: string): Promise<ConversationItem> {
    const body: StartConversationRequest = { sellerId };
    const res = await firstValueFrom(
      this.http.post<ApiResponse<ConversationItem>>(`${this.apiUrl}/start`, body)
    );
    const exists = this.conversations().some(c => c.id === res.data.id);
    if (!exists)
      this.conversations.update(prev => [res.data, ...prev]);

    return res.data;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = MessageType.Text,
    imageUrl: string | null = null
  ): Promise<void> {
    const body: SendMessageRequest = { conversationId, content, type, imageUrl };
    const res = await firstValueFrom(
      this.http.post<ApiResponse<MessageItem>>(`${this.apiUrl}/send`, body)
    );

    if (res.success) {
      this.activeMessages.update(prev => [...prev, res.data]);

      this.conversations.update(prev =>
        prev.map(c => c.id === conversationId
          ? { ...c, lastMessage: res.data }
          : c
        )
      );
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/${conversationId}/read`, {})
    );
    this.conversations.update(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );
  }

  async openConversation(conversation: ConversationItem): Promise<void> {
    this.activeConversation.set(conversation);
    await this.loadMessages(conversation.id);
    if (conversation.unreadCount > 0)
      await this.markAsRead(conversation.id);
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}