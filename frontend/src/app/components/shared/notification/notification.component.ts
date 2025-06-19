import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, ToastNotification } from '../../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: ToastNotification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.toastNotifications$.subscribe((notification: ToastNotification) => {
      this.notifications.push(notification);
      
      // Auto remove notification after timeout
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.timeout || 3000);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(notification: ToastNotification): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }
}
