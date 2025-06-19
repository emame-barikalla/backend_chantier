import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Role } from '../models/role.model';

export interface RoleDTO {
  name: string;
  description: string;
  permissions: { id: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = `${environment.apiUrl}/admin/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.API_URL}/user`).pipe(
      catchError(this.handleError)
    );
  }

  // Add this method to fetch all roles (for admin and MOA)
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.API_URL}/all`).pipe(
      catchError(this.handleError)
    );
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createRole(role: RoleDTO): Observable<Role> {
    return this.http.post<Role>(`${this.API_URL}/add`, role).pipe(
      catchError(this.handleError)
    );
  }

  updateRole(id: number, role: RoleDTO): Observable<Role> {
    return this.http.put<Role>(`${this.API_URL}/update/${id}`, role).pipe(
      catchError(this.handleError)
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
