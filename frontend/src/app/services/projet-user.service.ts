import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ERole } from '../enum/role.enum';

export interface ProjetUserDTO {
  id: number;
  projetId: number;
  userId: number;
  role: ERole;
  isActive: boolean;
  userNom: string;
  userPrenom: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetUserService {
  private readonly API_URL = `${environment.apiUrl}/projet-users`;

  constructor(private http: HttpClient) {}

  assignUserToProject(projetId: number, userId: number, role: ERole): Observable<ProjetUserDTO> {
    return this.http.post<ProjetUserDTO>(`${this.API_URL}/${projetId}/users/${userId}/role/${role}`, {});
  }

  removeUserFromProject(projetId: number, userId: number, role: ERole): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projetId}/users/${userId}/role/${role}`);
  }

  getProjectUsers(projetId: number): Observable<ProjetUserDTO[]> {
    return this.http.get<ProjetUserDTO[]>(`${this.API_URL}/${projetId}/users`);
  }

  getProjectUsersByRole(projetId: number, role: ERole): Observable<ProjetUserDTO[]> {
    return this.http.get<ProjetUserDTO[]>(`${this.API_URL}/${projetId}/users/role/${role}`);
  }

  activateUserInProject(projetId: number, userId: number): Observable<ProjetUserDTO> {
    return this.http.put<ProjetUserDTO>(`${this.API_URL}/${projetId}/users/${userId}/activate`, {});
  }
} 