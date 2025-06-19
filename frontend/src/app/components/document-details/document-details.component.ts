import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Document } from '../../models/document.model';
import { DocumentCommentsComponent } from './document-comments/document-comments.component';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [
    CommonModule,
    DocumentCommentsComponent
  ],
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css']
})
export class DocumentDetailsComponent implements OnInit {
  document: Document | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadDocument(id);
      }
    });
  }

  loadDocument(id: number) {
    this.loading = true;
    this.error = null;
    
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        this.document = document;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.error = 'Failed to load document details';
        this.loading = false;
      }
    });
  }

  downloadDocument() {
    if (this.document) {
      this.documentService.viewDocument(this.document.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        },
        error: (error) => {
          console.error('Error downloading document:', error);
          alert('Failed to download document');
        }
      });
    }
  }

  deleteDocument() {
    if (this.document) {
      if (confirm('Are you sure you want to delete this document?')) {
        this.documentService.deleteDocument(this.document.id).subscribe({
          next: () => {
            this.router.navigate(['/documents']);
          },
          error: (error) => {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
          }
        });
      }
    }
  }
} 