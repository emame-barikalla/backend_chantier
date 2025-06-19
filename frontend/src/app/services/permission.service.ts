import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Permission } from '../models/permission.model';

export interface PermissionDTO {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly API_URL = `${environment.apiUrl}/admin/permissions`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.API_URL}/all`);
  }

  getPermissionById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.API_URL}/${id}`);
  }

  createPermission(permission: PermissionDTO): Observable<Permission> {
    return this.http.post<Permission>(`${this.API_URL}/add`, permission);
  }

  updatePermission(id: number, permission: PermissionDTO): Observable<Permission> {
    return this.http.put<Permission>(`${this.API_URL}/update/${id}`, permission);
  }

  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete/${id}`);
  }
}
