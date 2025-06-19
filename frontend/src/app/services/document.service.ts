import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { DocumentType } from '../enum/DocumentType';
import { environment } from '../../environments/environment';
import { DocumentComment } from '../models/document-comment.model';
import { DocumentChecklist, ChecklistItem } from '../models/document-checklist.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // Use the API URL from environment or fallback to relative path
  private apiUrl = environment.apiUrl ? `${environment.apiUrl}/documents` : '/api/documents';

  constructor(private http: HttpClient) { }

  uploadDocument(projetId: number, file: File, titre: string, description: string, type: DocumentType): Observable<Document> {
    const formData = new FormData();
    formData.append('projetId', projetId.toString());
    formData.append('file', file);
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('type', type);

   
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  getDocumentsByProjetId(projetId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/all`);
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  viewDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/view/${id}`, {
      responseType: 'blob'
    });
  }

  // Comments methods
  getDocumentComments(documentId: number): Observable<DocumentComment[]> {
    return this.http.get<DocumentComment[]>(`${this.apiUrl}/${documentId}/comments`);
  }

  addDocumentComment(documentId: number, comment: string): Observable<DocumentComment> {
    return this.http.post<DocumentComment>(`${this.apiUrl}/${documentId}/comments`, { comment });
  }

  updateDocumentComment(commentId: number, comment: string): Observable<DocumentComment> {
    return this.http.put<DocumentComment>(`${this.apiUrl}/comments/${commentId}`, { comment });
  }

  deleteDocumentComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }

  // Checklist methods
  getDocumentChecklist(documentId: number): Observable<DocumentChecklist> {
    return this.http.get<DocumentChecklist>(`${this.apiUrl}/${documentId}/checklist`);
  }

  createDocumentChecklist(documentId: number, items: { description: string }[]): Observable<DocumentChecklist> {
    return this.http.post<DocumentChecklist>(`${this.apiUrl}/${documentId}/checklist`, { items });
  }

  updateChecklistItem(itemId: number, isCompleted: boolean): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.apiUrl}/checklist/items/${itemId}`, { isCompleted });
  }

  addChecklistItem(documentId: number, description: string): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(`${this.apiUrl}/${documentId}/checklist/items`, { description });
  }

  deleteChecklistItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/checklist/items/${itemId}`);
  }
}
