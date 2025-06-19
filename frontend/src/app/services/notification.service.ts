import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';
import 'global';
import { Client } from '@stomp/stompjs';
import { tap, catchError } from 'rxjs/operators';

export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new Subject<ToastNotification>();
  private notificationsCountSubject = new BehaviorSubject<number>(0);
  private userNotificationsSubject = new BehaviorSubject<Notification[]>([]);
  private stompClient: Client | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
  toastNotifications$: Observable<ToastNotification> = this.notificationsSubject.asObservable();
  notificationsCount$ = this.notificationsCountSubject.asObservable();
  userNotifications$ = this.userNotificationsSubject.asObservable();

  private readonly API_URL = `${environment.apiUrl}/notifications`;
  private readonly WS_URL = `http://localhost:8080/ws`;

  constructor(private http: HttpClient) { }

  // Toast notification methods
  success(message: string, timeout = 3000): void {
    this.showToast({ message, type: 'success', timeout });
  }

  error(message: string, timeout = 5000): void {
    this.showToast({ message, type: 'error', timeout });
  }

  info(message: string, timeout = 3000): void {
    this.showToast({ message, type: 'info', timeout });
  }

  warning(message: string, timeout = 4000): void {
    this.showToast({ message, type: 'warning', timeout });
  }

  private showToast(notification: ToastNotification): void {
    this.notificationsSubject.next(notification);
  }

  // Backend notification API methods
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/user/${userId}`);
  }

  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/user/${userId}/unread`);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/user/${userId}/count`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${notificationId}/read`, {}).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/user/${userId}/read-all`, {}).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  // Load user notifications and update the subjects
  loadUserNotifications(userId: number): void {
    this.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.userNotificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  // Update the unread count based on notifications
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.notificationsCountSubject.next(unreadCount);
  }

  // WebSocket connection setup
  async connectWebSocket(userId: string): Promise<void> {
    if (this.isConnecting || (this.stompClient && this.stompClient.connected)) {
      return;
    }

    this.isConnecting = true;
    try {
      const SockJS = (await import('sockjs-client')).default;
      const socket = new SockJS(this.WS_URL);
      
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          this.handleConnectionError();
        },
        onWebSocketError: (event) => {
          console.error('WebSocket Error:', event);
          this.handleConnectionError();
        },
        onWebSocketClose: () => {
          this.handleConnectionError();
        }
      });

      this.stompClient.onConnect = (frame) => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        const subscriptionPath = `/queue/user/${userId}/notifications`;
        
        this.stompClient?.subscribe(subscriptionPath, (message) => {
          try {
            const notification = JSON.parse(message.body) as Notification;
            
            const currentNotifications = this.userNotificationsSubject.value;
            const updatedNotifications = [notification, ...currentNotifications];
            
            this.userNotificationsSubject.next(updatedNotifications);
            this.updateUnreadCount(updatedNotifications);
            
            if (notification.message) {
              this.info(notification.message);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });
      };

      await this.stompClient.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError(): void {
    this.isConnecting = false;
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connectWebSocket(this.stompClient?.connected ? 'reconnect' : 'new');
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnectWebSocket(): void {
    if (this.stompClient) {
      if (this.stompClient.connected) {
        this.stompClient.deactivate();
      }
      this.stompClient = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }
}
