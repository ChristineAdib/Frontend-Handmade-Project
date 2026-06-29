import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalr from '@microsoft/signalr';
import { firstValueFrom, Subject } from 'rxjs';
import { NotificationItem } from '../Models/Notification';
import { NotificationType } from '../Models/NotificationType';
import { ApiResponse } from '../../auth/models/api-response.model';
import { PagedResult } from '../../models/paged-result';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = `${environment.apiUrl}/api/notification`;
  private readonly hubUrl  = `${environment.apiUrl}/hubs/notifications`;

  readonly notifications       = signal<NotificationItem[]>([]);
  readonly unreadCount         = signal<number>(0);
  readonly isConnected         = signal<boolean>(false);
  readonly notificationReceived$ = new Subject<NotificationItem>();

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.isRead)
  );

  private hubConnection: signalr.HubConnection | null = null;

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
          console.log('Notification SignalR connection restarted.');
          return;
        } catch (err) {
          console.error('Notification SignalR connection restart failed:', err);
          return;
        }
      }
    }

    const connectionOptions: any = {
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
    } catch (err) {
      console.error('Notification hub connection failed:', err);
      this.isConnected.set(false);
      this.hubConnection = null;
    }
  }

  async stopConnection(): Promise<void> {
    await this.hubConnection?.stop();
    this.isConnected.set(false);
  }

  private normalizeNotification(notif: any): NotificationItem {
    let typeVal = notif.type;
    if (typeof typeVal === 'string') {
      const parsed = Number(typeVal);
      if (!isNaN(parsed)) {
        typeVal = parsed;
      } else {
        const nameMap: Record<string, number> = {
          'Order': 1,
          'Payment': 2,
          'Review': 3,
          'System': 4,
          'Coupon': 5,
          'Follow': 6,
          'Message': 7,
          'NewFollower': 8,
          'ProductSubmitted': 9,
          'ProductApproved': 10,
          'ProductRejected': 11,
          'ProductUpdated': 12,
          'ProductUpdateApproved': 13,
          'ProductUpdateRejected': 14,
          'NewProductFromFollowedShop': 15,
          'NewOrder': 16,
          'PaymentReceived': 17,
          'UserBanned': 18,
          'OrderStatusChanged': 19
        };
        typeVal = nameMap[typeVal] ?? 0;
      }
    }
    return {
      ...notif,
      type: typeVal
    };
  }

  private registerHandlers(): void {
    this.hubConnection!.on('ReceiveNotification', (notification: any) => {
      const normalized = this.normalizeNotification(notification);
      if (normalized.type !== NotificationType.Message) {
        this.notifications.update(prev => [normalized, ...prev]);
      }
      this.notificationReceived$.next(normalized);
    });

    this.hubConnection!.on('UnreadCountUpdated', (count: number) => {
      this.unreadCount.set(count);
    });

    this.hubConnection!.onreconnected(() => this.isConnected.set(true));
    this.hubConnection!.onreconnecting(() => this.isConnected.set(false));
  }

  async loadNotifications(pageNumber: number = 1, pageSize: number = 10): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<PagedResult<any>>>(
        `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      )
    );
    if (res.success && res.data) {
      const normalizedItems = res.data.items.map(n => this.normalizeNotification(n));
      const items = normalizedItems.filter(n => n.type !== NotificationType.Message);
      if (pageNumber === 1) {
        this.notifications.set(items);
      } else {
        this.notifications.update(prev => [...prev, ...items]);
      }
    }
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