import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentComment } from '../models/document-comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentCommentService {
  private apiUrl = environment.apiUrl ? `${environment.apiUrl}/documents` : '/api/documents';

  constructor(private http: HttpClient) {}

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
  
}

