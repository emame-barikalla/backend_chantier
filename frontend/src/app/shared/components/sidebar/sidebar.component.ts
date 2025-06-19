import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isAdmin: boolean = false;
  readonly ADMIN_ROLE = 'ROLE_ADMIN';
  readonly MOA_ROLE = 'ROLE_MAITRE_OUVRAGE';
  isMoa: boolean = false;
  IsMaitreOeuvre: boolean = false;
  readonly MAITRE_OEUVRE_ROLE = 'ROLE_MAITRE_OEUVRE';

  constructor(private authService: AuthService) {
    this.checkAdminStatus();
    this.isMoa = this.authService.hasRole(this.MOA_ROLE);
    this.IsMaitreOeuvre = this.authService.hasRole(this.MAITRE_OEUVRE_ROLE);

    
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authService.hasRole(this.ADMIN_ROLE);
  }
}