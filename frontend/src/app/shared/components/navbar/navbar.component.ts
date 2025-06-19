import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';
import { NotificationDropdownComponent } from '../../../components/shared/notification/notification-dropdown.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  userAvatar: string = 'assets/images/default-avatar.png';
  showProfileMenu: boolean = false;
  showNotifications: boolean = false;
  isAdmin: boolean = false;
  readonly ADMIN_ROLE = 'ROLE_ADMIN';
  readonly MOA_ROLE = 'ROLE_MAITRE_OUVRAGE';
  readonly SOUS_TRAITANT_ROLE = 'ROLE_SOUS_TRAITANT';
  readonly CONTROLEUR_ROLE = 'ROLE_CONTROLEUR_TECHNIQUE';
  isMaitreOeuvre: boolean = false;
  readonly MAITRE_OEUVRE_ROLE = 'ROLE_MAITRE_OEUVRE';
  isMoa: boolean = false;
  isSousTraitant: boolean = false;
  isControleur: boolean = false;
  
  // Notification related properties
  notifications: Notification[] = [];
  unreadCount: number = 0;
  private notificationSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.checkAdminStatus();
    this.checkMoaStatus();
    this.checkSousTraitantStatus();
    this.checkControleurStatus();
    this.isMaitreOeuvre = this.authService.hasRole(this.MAITRE_OEUVRE_ROLE);
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Initialize WebSocket connection
        this.notificationService.connectWebSocket(user.id.toString()).catch(error => {
          console.error('Failed to connect to WebSocket:', error);
        });
        
        // Load initial notifications
        this.loadNotifications(user.id);
        
        // Subscribe to notification count updates
        this.notificationSubscription = this.notificationService.notificationsCount$.subscribe(
          count => this.unreadCount = count
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.notificationService.disconnectWebSocket();
  }

  private loadNotifications(userId: number): void {
    this.notificationService.loadUserNotifications(userId);
    this.notificationService.userNotifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authService.hasRole(this.ADMIN_ROLE);
  }

  private checkMoaStatus(): void {
    this.isMoa = this.authService.hasRole(this.MOA_ROLE);
  }

  private checkSousTraitantStatus(): void {
    this.isSousTraitant = this.authService.hasRole(this.SOUS_TRAITANT_ROLE);
  }

  private checkControleurStatus(): void {
    this.isControleur = this.authService.hasRole(this.CONTROLEUR_ROLE);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }
  
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
      
      // Refresh notifications when opening dropdown
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.notificationService.loadUserNotifications(currentUser.id);
      }
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const userProfileEl = document.querySelector('.user-profile');
    const notificationIconEl = document.querySelector('.notification-icon');
    
    if (userProfileEl && !userProfileEl.contains(event.target as Node) && this.showProfileMenu) {
      this.showProfileMenu = false;
    }
    
    if (notificationIconEl && !notificationIconEl.contains(event.target as Node) 
        && !document.querySelector('.notification-dropdown')?.contains(event.target as Node)
        && this.showNotifications) {
      this.showNotifications = false;
    }
  }
}