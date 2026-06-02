import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalr from '@microsoft/signalr';
import { firstValueFrom } from 'rxjs';
import { NotificationItem } from '../Models/Notification';
import{ ApiResponse } from '../../auth/models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = `${environment.apiUrl}/api/notification`;
  private readonly hubUrl  = `${environment.apiUrl}/hubs/notifications`;

  readonly notifications       = signal<NotificationItem[]>([]);
  readonly unreadCount         = signal<number>(0);
  readonly isConnected         = signal<boolean>(false);

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.isRead)
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
      console.error('Notification hub connection failed:', err);
    }
  }

  async stopConnection(): Promise<void> {
    await this.hubConnection?.stop();
    this.isConnected.set(false);
  }

  private registerHandlers(): void {
    this.hubConnection!.on('ReceiveNotification', (notification: NotificationItem) => {
      this.notifications.update(prev => [notification, ...prev]);
    });

    this.hubConnection!.on('UnreadCountUpdated', (count: number) => {
      this.unreadCount.set(count);
    });

    this.hubConnection!.onreconnected(() => this.isConnected.set(true));
    this.hubConnection!.onreconnecting(() => this.isConnected.set(false));
  }

  async loadNotifications(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<NotificationItem[]>>(this.apiUrl)
    );
    if (res.success) this.notifications.set(res.data);
  }

  async loadUnreadCount(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<number>>(`${this.apiUrl}/unread-count`)
    );
    if (res.success) this.unreadCount.set(res.data);
  }

  async markAsRead(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.apiUrl}/${id}/read`, {}));
    this.notifications.update(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    this.unreadCount.update(count => Math.max(0, count - 1));
  }

  async markAllAsRead(): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.apiUrl}/read-all`, {}));
    this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}