import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentChecklist, ChecklistItem } from '../models/document-checklist.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentChecklistService {
  private apiUrl = environment.apiUrl ? `${environment.apiUrl}/documents` : '/api/documents';

  constructor(private http: HttpClient) {}

  getDocumentChecklist(documentId: number): Observable<DocumentChecklist> {
    return this.http.get<DocumentChecklist>(`${this.apiUrl}/${documentId}/checklist`);
  }

  addChecklistItem(documentId: number, description: string): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(`${this.apiUrl}/${documentId}/checklist/items`, { description });
  }

  updateChecklistItem(itemId: number, isCompleted: boolean): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.apiUrl}/checklist/items/${itemId}`, { isCompleted });
  }

  deleteChecklistItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/checklist/items/${itemId}`);
  }
}

