import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentChecklistService } from '../../../services/document-checklist.service';
import { DocumentChecklist, ChecklistItem } from '../../../models/document-checklist.model';

@Component({
  selector: 'app-document-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-checklist.component.html',
  styleUrls: ['./document-checklist.component.css']
})
export class DocumentChecklistComponent implements OnInit {
  @Input() documentId!: number;
  checklist: DocumentChecklist | null = null;
  loading = false;
  newItemDescription = '';
  showAddModal = false;

  constructor(private checklistService: DocumentChecklistService) {}

  ngOnInit(): void {
    this.loadChecklist();
  }

  loadChecklist(): void {
    this.loading = true;
    this.checklistService.getDocumentChecklist(this.documentId).subscribe({
      next: (data: DocumentChecklist) => {
        this.checklist = data;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading checklist:', error);
        this.loading = false;
        alert('Failed to load checklist');
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newItemDescription = '';
  }

  addItem(): void {
    if (!this.newItemDescription.trim()) return;

    this.checklistService.addChecklistItem(this.documentId, this.newItemDescription).subscribe({
      next: (item: ChecklistItem) => {
        if (!this.checklist) {
          this.checklist = {
            id: 0,
            documentId: this.documentId,
            items: [],
            createdBy: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        this.checklist.items.push(item);
        this.closeAddModal();
      },
      error: (error: Error) => {
        console.error('Error adding item:', error);
        alert('Failed to add item');
      }
    });
  }

  updateItem(itemId: number, event: Event): void {
    const isCompleted = (event.target as HTMLInputElement).checked;
    this.checklistService.updateChecklistItem(itemId, isCompleted).subscribe({
      next: (updatedItem: ChecklistItem) => {
        if (this.checklist) {
          const index = this.checklist.items.findIndex(item => item.id === itemId);
          if (index !== -1) {
            this.checklist.items[index] = updatedItem;
          }
        }
      },
      error: (error: Error) => {
        console.error('Error updating item:', error);
        alert('Failed to update item');
      }
    });
  }

  deleteItem(itemId: number): void {
    if (!confirm('Are you sure you want to delete this item?')) return;

    this.checklistService.deleteChecklistItem(itemId).subscribe({
      next: () => {
        if (this.checklist) {
          this.checklist.items = this.checklist.items.filter(item => item.id !== itemId);
        }
      },
      error: (error: Error) => {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    });
  }
} 