import { Injectable, OnDestroy, signal } from '@angular/core';
import * as signalr from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Message } from '../Models/message.model';
import { Conversation } from '../Models/conversation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalrService implements OnDestroy {
  private hubUrl = `${environment.apiUrl}/hubs/chat`;
  private hubConnection: signalr.HubConnection | null = null;

  // Connection State Signal
  readonly isConnected = signal<boolean>(false);

  // RxJS Event Emitters
  readonly messageReceived$ = new Subject<Message>();
  readonly conversationStarted$ = new Subject<Conversation>();
  readonly messagesRead$ = new Subject<{ conversationId: string }>();

  async startConnection(token: string): Promise<void> {
    if (this.hubConnection) {
      const state = this.hubConnection.state;
      if (state === signalr.HubConnectionState.Connected ||
          state === signalr.HubConnectionState.Connecting ||
          state === signalr.HubConnectionState.Reconnecting) {
        return;
      }

      if (state === signalr.HubConnectionState.Disconnected) {
        try {
          await this.hubConnection.start();
          this.isConnected.set(true);
          console.log('SignalR connection restarted successfully.');
          return;
        } catch (err) {
          console.error('SignalR connection restart failed:', err);
          throw err;
        }
      }
    }

    const connectionOptions: signalr.IHttpConnectionOptions = {
      accessTokenFactory: () => token
    };

    if (environment.authMode === 'cookie') {
      connectionOptions.withCredentials = true;
    } else {
      connectionOptions.withCredentials = false;
    }

    this.hubConnection = new signalr.HubConnectionBuilder()
      .withUrl(this.hubUrl, connectionOptions)
      .withAutomaticReconnect()
      .configureLogging(signalr.LogLevel.Warning)
      .build();

    this.registerHandlers();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      console.log('SignalR connected successfully.');
    } catch (err) {
      console.error('SignalR connection failed to start:', err);
      this.isConnected.set(false);
      this.hubConnection = null;
      throw err;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        this.isConnected.set(false);
        console.log('SignalR connection stopped.');
      } catch (err) {
        console.error('SignalR connection stop failed:', err);
      } finally {
        this.hubConnection = null;
      }
    }
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.messageReceived$.next(message);
    });

    this.hubConnection.on('ConversationStarted', (conversation: Conversation) => {
      this.conversationStarted$.next(conversation);
    });

    this.hubConnection.on('MessagesRead', (conversationId: string) => {
      this.messagesRead$.next({ conversationId });
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      console.log('SignalR reconnected.');
    });

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
      console.log('SignalR is reconnecting...');
    });

    this.hubConnection.onclose((err) => {
      this.isConnected.set(false);
      console.warn('SignalR connection closed:', err);
    });
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
