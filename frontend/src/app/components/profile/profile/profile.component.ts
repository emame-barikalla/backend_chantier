import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.isLoading = false;
    } else {
      this.error = "Impossible de charger les informations de l'utilisateur";
      this.isLoading = false;
    }
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/change-password']);
  }
}
