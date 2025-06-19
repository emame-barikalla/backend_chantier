import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompteRendu } from '../models/compte-rendu.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompteRenduService {
  private apiUrl = `${environment.apiUrl}/compte-rendus`;

  constructor(private http: HttpClient) {}

  createCompteRendu(
    projetId: number,
    userId: number,
    titre: string,
    description: string,
    fileType: string,
    file: File
  ): Observable<CompteRendu> {
    const formData = new FormData();
    formData.append('projetId', projetId.toString());
    formData.append('userId', userId.toString());
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('fileType', fileType);
    formData.append('file', file);

    return this.http.post<CompteRendu>(this.apiUrl, formData);
  }

  getByProjet(projetId: number): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  getByProjetAndType(projetId: number, fileType: string): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(`${this.apiUrl}/projet/${projetId}/type/${fileType}`);
  }

  getById(id: number): Observable<CompteRendu> {
    return this.http.get<CompteRendu>(`${this.apiUrl}/${id}`);
  }

  getFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/file/${id}`, { responseType: 'blob' });
  }

  deleteCompteRendu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllCompteRendus(): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(this.apiUrl);
  }
}
