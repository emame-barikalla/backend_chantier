import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { UserService } from './user.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly API_URL = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
    } else if (token) {
      // If we have a token but no user data, try to fetch it
      this.refreshUserData();
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          // Fetch user data after successful login
          this.fetchAndStoreUserData();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.roles.some(role => 
      role.permissions.some(perm => perm.name === permission)
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (user && user.roles) {
      return user.roles.some(role => role.name === roleName);
    }

    const token = this.getToken();
    if (!token) return false;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;

      const payload = JSON.parse(atob(tokenParts[1]));
      const authorities = payload.authorities || [];
      return authorities.includes(roleName);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return false;
    }
  }

  changePassword(passwordChangeRequest: PasswordChangeRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/change-password`, passwordChangeRequest);
  }

  private fetchAndStoreUserData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }

  private refreshUserData(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;

      const payload = JSON.parse(atob(tokenParts[1]));
      const email = payload.sub;

      if (email) {
        this.fetchAndStoreUserData();
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }
}


