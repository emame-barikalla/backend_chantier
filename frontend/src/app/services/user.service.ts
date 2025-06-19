import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

export interface UserDTO {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password?: string;
  roles: { id: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/admin/users`;
  private readonly AUTH_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/all`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(user: UserDTO): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/add`, user);
  }

  updateUser(id: number, user: UserDTO): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/update/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete/${id}`);
  }

  // Additional methods for specific user types
  getClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/clients`);
  }
  getBureauxSuivi(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/bureauxSuivi`);
  }

  getEntreprises(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/entreprises`);
  }
  
  getMaitresOeuvres(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/maitreOeuvres`);
  }

  getSousTraitants(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/sousTraitants`);
  }
  
  getControlleurs(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/controlleurs`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/email/${email}`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.AUTH_URL}/current-user`);
  }
}
