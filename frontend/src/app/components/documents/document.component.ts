import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Document} from '../../models/document.model';
import { DocumentType } from '../../enum/DocumentType';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  paginatedDocuments: Document[] = [];
  projetId: number | null = null;
  isLoading: boolean = false;
  isUploading: boolean = false;
  documentForm: FormGroup;
  showModal: boolean = false;
  selectedFile: File | null = null;
  documentTypes = Object.values(DocumentType);
  searchQuery: string = '';
  selectedTypeFilter: string = '';
  fileRequired: boolean = false;
  isFromArchive: boolean = false;
  showDocumentView: boolean = false;
  selectedDocumentId: number | null = null;
  isTitleUnique: boolean = true;
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;

  constructor(
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check query parameters for source
    this.route.queryParams.subscribe(params => {
      this.isFromArchive = params['from'] === 'archive';
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projetId = +id;
        this.loadProjectDocuments();
      } else {
        this.loadAllDocuments();
      }
    });
  }

  loadProjectDocuments(): void {
    if (!this.projetId) return;
    
    this.isLoading = true;
    this.documentService.getDocumentsByProjetId(this.projetId).subscribe({
      next: (data) => {
        this.documents = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project documents:', error);
        this.isLoading = false;
      }
    });
  }

  loadAllDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading all documents:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.documents];
    
    // Apply type filter
    if (this.selectedTypeFilter) {
      result = result.filter(doc => doc.type === this.selectedTypeFilter);
    }
    
    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(doc => 
        doc.titre.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        doc.fileName.toLowerCase().includes(query)
      );
    }
    
    this.filteredDocuments = result;
    this.totalPages = Math.ceil(this.filteredDocuments.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
    this.updatePaginatedDocuments();
  }

  updatePaginatedDocuments(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredDocuments.length);
    this.paginatedDocuments = this.filteredDocuments.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedDocuments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedDocuments();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedDocuments();
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedTypeFilter = '';
    this.applyFilters();
  }

  checkTitleUniqueness(title: string): boolean {
    // If editing a document, we need to exclude the current document from the check
    return !this.documents.some(doc => doc.titre.toLowerCase() === title.toLowerCase());
  }

  onTitleChange(): void {
    const titleValue = this.documentForm.get('titre')?.value;
    if (titleValue && titleValue.trim() !== '') {
      this.isTitleUnique = this.checkTitleUniqueness(titleValue);
    } else {
      this.isTitleUnique = true; // Reset when title is empty
    }
  }

  openModal(): void {
    this.showModal = true;
    this.documentForm.reset();
    this.selectedFile = null;
    this.fileRequired = false;
    this.isTitleUnique = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.fileRequired = false;
    }
  }
  
  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.fileRequired = true;
      return;
    }
    
    const titleValue = this.documentForm.get('titre')?.value;
    if (titleValue && !this.checkTitleUniqueness(titleValue)) {
      this.isTitleUnique = false;
      return;
    }
    
    if (this.documentForm.valid && this.selectedFile && this.projetId) {
      this.isUploading = true;
      this.isLoading = true;
      const { titre, description, type } = this.documentForm.value;
      
      this.documentService.uploadDocument(
        this.projetId,
        this.selectedFile,
        titre,
        description,
        type
      ).subscribe({
        next: (document) => {
          console.log('Document uploaded successfully:', document);
          this.loadProjectDocuments();
          this.closeModal();
          this.isUploading = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          
          if (error.status === 404) {
            console.error('API endpoint not found. Please check server URL and API path.');
          } else if (error.status === 0) {
            console.error('Server unreachable. Please check if the backend server is running.');
          }
          
          this.isUploading = false;
          this.isLoading = false;
          alert(`Failed to upload document: ${error.status} ${error.statusText}\nPlease check console for details.`);
        }
      });
    } else {
      Object.keys(this.documentForm.controls).forEach(key => {
        const control = this.documentForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  downloadDocument(id: number, fileName: string): void {
    this.isLoading = true;
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.isLoading = false;
        alert('Failed to download document');
      }
    });
  }

  deleteDocument(id: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.isLoading = true;
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadProjectDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.isLoading = false;
          alert('Failed to delete document');
        }
      });
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return 'far fa-file-pdf';
      case 'doc':
      case 'docx':
        case 'odt':
        return 'far fa-file-word';
      case 'xls':


      case 'xlsx':
      case 'ods'
      :
        return 'far fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'far fa-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'far fa-file-image';
      case 'zip':
      case 'rar':
      case '7z':
        return 'far fa-file-archive';
      case 'txt':
        return 'far fa-file-alt';
      case 'mp4':
        return 'far fa-file-video';

      default:
        return 'far fa-file';
    }
  }

  getFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  navigateToProjet(): void {
    if (this.isFromArchive) {
      this.router.navigate(['/archives']);
    } else {
      this.router.navigate(['/projets']);
    }
  }

  viewDocument(id: number, fileName: string): void {
    this.isLoading = true;
    this.documentService.viewDocument(id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        // Create a blob URL and open it in a new tab
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up the URL object after opening
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (error) => {
        console.error('Error viewing document:', error);
        this.isLoading = false;
        alert('Failed to view document');
      }
    });
  }
}
