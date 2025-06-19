import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tache } from '../models/tache.model';
import { Statut } from '../enum/statut.enum';

export interface TacheDTO {
  description: string;
  statut: Statut; // Enum value as string
  date?: Date; // ISO date string
  projetId: number;
  
  //projetNom: string;      // new field
  assigneeId: number;
  //assigneeNom: string;    // new field
}


@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private readonly API_URL = `${environment.apiUrl}/taches`;

  constructor(private http: HttpClient) {}

  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.API_URL}/all`);
  }

  getTacheById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.API_URL}/${id}`);
  }

  getTachesByProjectId(projectId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.API_URL}/project/${projectId}`);
  }

  createTache(tache: TacheDTO): Observable<Tache> {
    return this.http.post<Tache>(`${this.API_URL}/creer`, tache);
  }

  updateTache(id: number, tache: TacheDTO): Observable<Tache> {
    return this.http.put<Tache>(`${this.API_URL}/update/${id}`, tache);
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
