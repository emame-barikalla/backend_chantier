import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentCommentService } from '../../../services/document-comment.service';
import { DocumentComment } from '../../../models/document-comment.model';
import { AuthService } from '../../../services/auth.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-document-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-comments.component.html',
  styleUrls: ['./document-comments.component.css']
})
export class DocumentCommentsComponent implements OnInit {
  @Input() documentId!: number;
  comments: DocumentComment[] = [];
  loading = false;
  newComment = '';
  showModal = false;
  editingComment: DocumentComment | null = null;
  isControleurTechnique = false;

  constructor(
    private commentService: DocumentCommentService,
    private authService: AuthService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isControleurTechnique = this.authService.hasRole('ROLE_CONTROLEUR_TECHNIQUE');
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.commentService.getDocumentComments(this.documentId).subscribe({
      next: (data: DocumentComment[]) => {
        this.comments = data;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
        alert('Failed to load comments');
      }
    });
  }

  openAddModal(): void {
    this.editingComment = null;
    this.newComment = '';
    this.showModal = true;
  }

  editComment(comment: DocumentComment): void {
    this.editingComment = comment;
    this.newComment = comment.comment;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingComment = null;
    this.newComment = '';
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    this.commentService.addDocumentComment(this.documentId, this.newComment).subscribe({
      next: (comment: DocumentComment) => {
        this.comments.push(comment);
        this.closeModal();
      },
      error: (error: Error) => {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
      }
    });
  }

  updateComment(): void {
    if (!this.editingComment || !this.newComment.trim()) return;

    this.commentService.updateDocumentComment(this.editingComment.id, this.newComment).subscribe({
      next: (updatedComment: DocumentComment) => {
        const index = this.comments.findIndex(c => c.id === updatedComment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        this.closeModal();
      },
      error: (error: Error) => {
        console.error('Error updating comment:', error);
        alert('Failed to update comment');
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteDocumentComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      },
      error: (error: Error) => {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    });
  }

  /**
   * Navigate back to the document details view
   */
  navigateBackToDocument(): void {
    // Option 1: Using Location service to go back in browser history
    this.location.back();
    
    // Option 2: Navigate to document details explicitly
    // If you're using a specific route structure like /documents/:id
    // this.router.navigate(['../'], { relativeTo: this.route });
    
    // Option 3: If you know the exact route
    // this.router.navigate(['/documents', this.documentId]);
  }
}