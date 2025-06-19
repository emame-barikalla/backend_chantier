import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Projet } from '../models/projet.model';
import { Status } from '../enum/status.enum';
import { Category } from '../enum/category.enum';

export interface ProjetDTO {
  nom: string;
  dateDebut?: Date; // ISO date string
  dateFin?: Date; // ISO date string
  budget?: number;
  status: Status;
  category: Category;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private readonly API_URL = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/all`);
  }

  getProjectById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.API_URL}/${id}`);
  }

  createProject(project: ProjetDTO): Observable<Projet> {
    return this.http.post<Projet>(`${this.API_URL}/creer`, project);
  }

  updateProject(id: number, project: ProjetDTO): Observable<Projet> {
    return this.http.put<Projet>(`${this.API_URL}/update/${id}`, project);
  }

  // deleteProject(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.API_URL}/delete/${id}`);
  // }

  getProjectsByStatus(status: Status): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/status/${status}`);
  }

  getArchivedProjects(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/archived`);
  }

  archiveProject(id: number): Observable<string> {
    return this.http.put<string>(`${this.API_URL}/archive/${id}`, {}, {
      responseType: 'text' as 'json' // Specify text response type
    });
  }

  getProjectsByCategory(category: Category): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/category/${category}`);
  }

  getProjectsByStatusAndMonth(): Observable<{ [key: string]: { [key: number]: number } }> {
    return this.getAllProjects().pipe(
      map(projects => {
        const result: { [key: string]: { [key: number]: number } } = {
          [Status.TERMINE]: {},
          [Status.EN_COURS]: {}
        };
        
        // Initialize month counters (1-12 for Jan-Dec)
        for (let i = 1; i <= 12; i++) {
          result[Status.TERMINE][i] = 0;
          result[Status.EN_COURS][i] = 0;
        }
        
        projects.forEach(project => {
          if (project.dateDebut) {
            const month = new Date(project.dateDebut).getMonth() + 1; // getMonth() returns 0-11
            
            if (project.status === Status.TERMINE) {
              result[Status.TERMINE][month]++;
            } else if (project.status === Status.EN_COURS) {
              result[Status.EN_COURS][month]++;
            }
          }
        });
        
        return result;
      })
    );
  }
  
  getProjectsByStatusAndYear(year?: number): Observable<{ [key: string]: number }> {
    return this.getAllProjects().pipe(
      map(projects => {
        const targetYear = year || new Date().getFullYear();
        const result: { [key: string]: number } = {
          [Status.TERMINE]: 0,
          [Status.EN_COURS]: 0,
          [Status.PLANIFIE]: 0,
          [Status.RETARDE]: 0
        };
        
        projects.forEach(project => {
          // Check projects that started in the target year
          if (project.dateDebut) {
            const startYear = new Date(project.dateDebut).getFullYear();
            if (startYear === targetYear) {
              result[project.status]++;
            }
          }
          
          // Check projects that finished in the target year
          if (project.status === Status.TERMINE && project.dateFin) {
            const endYear = new Date(project.dateFin).getFullYear();
            if (endYear === targetYear && 
                (!project.dateDebut || new Date(project.dateDebut).getFullYear() !== targetYear)) {
              // Only count it if we didn't already count it in the dateDebut check
              result[project.status]++;
            }
          }
        });
        
        return result;
      })
    );
  }
}
