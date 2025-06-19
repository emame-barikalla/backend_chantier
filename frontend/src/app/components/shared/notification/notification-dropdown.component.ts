import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit {
  @Input() notifications: Notification[] = [];
  @Input() showDropdown: boolean = false;
  @Output() close = new EventEmitter<void>();
  
  isLoading: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to the current user observable
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
      } else {
        this.currentUserId = null;
      }
    });

    // Also try to get the current user immediately
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
    } else {
      this.authService['refreshUserData']();
    }
  }

  getNotificationIcon(type: string): string {
    if (type.includes('PROJECT')) {
      return 'fas fa-project-diagram';
    } else if (type.includes('USER_ASSIGNMENT')) {
      return 'fas fa-user-plus';
    } else if (type.includes('DOCUMENT')) {
      return 'fas fa-file-alt';
    } else if (type.includes('TASK')) {
      return 'fas fa-tasks';
    } else {
      return 'fas fa-bell';
    }
  }

  getNotificationClass(notification: Notification): string {
    return notification.read ? 'read' : 'unread';
  }

  getTimeAgo(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    if (!this.currentUserId) {
      this.authService['refreshUserData']();
      return;
    }

    if (notification.read) {
      return;
    }

    this.isLoading = true;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Create a new array to trigger change detection
        this.notifications = this.notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        
        // Update the notification count
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationService['notificationsCountSubject'].next(unreadCount);
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  markAllAsRead(): void {
    if (!this.currentUserId) {
      this.authService['refreshUserData']();
      return;
    }

    this.isLoading = true;
    this.notificationService.markAllAsRead(this.currentUserId).subscribe({
      next: () => {
        // Create a new array to trigger change detection
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        // Update the notification count to 0
        this.notificationService['notificationsCountSubject'].next(0);
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  navigateToNotification(notification: Notification): void {
    if (!notification.read) {
      this.markAsRead(notification, new Event('click'));
    }
    
    this.close.emit();
    
    // Handle navigation based on notification type
    if (notification.type && notification.type.includes('PROJECT')) {
      this.router.navigate(['/projets']);
    } else if (notification.type && notification.type.includes('DOCUMENT')) {
      this.router.navigate(['/documents']);
    } else if (notification.type && notification.type.includes('USER_ASSIGNMENT')) {
      this.router.navigate(['/projets']);
    }else if (notification.type && notification.type.includes('TASK')) {
        this.router.navigate(['/tasks']);
    } else {
      // Default to dashboard for any other notification types
      this.router.navigate(['/profile']);
    }
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.close.emit();
  }
}
