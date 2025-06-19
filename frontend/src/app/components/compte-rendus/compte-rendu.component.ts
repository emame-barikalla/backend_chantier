import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompteRenduService } from '../../services/compte-rendu.service';
import { CompteRendu } from '../../models/compte-rendu.model';

@Component({
  selector: 'app-compte-rendu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './compte-rendu.component.html',
  styleUrls: ['./compte-rendu.component.css']
})
export class CompteRenduComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modalRef!: ElementRef;
  compteRendus: CompteRendu[] = [];
  filteredCompteRendus: CompteRendu[] = [];
  paginatedCompteRendus: CompteRendu[] = [];
  projetId: number | null = null;
  isLoading: boolean = false;
  isUploading: boolean = false;
  compteRenduForm: FormGroup;
  showModal: boolean = false;
  selectedFile: File | null = null;
  fileTypes = ['PHOTO', 'VIDEO'];
  selectedTypeFilter: string = '';
  fileRequired: boolean = false;
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  // Add this new property for image previews
  previewUrls: { [key: number]: string } = {};

  constructor(
    private compteRenduService: CompteRenduService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.compteRenduForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      fileType: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projetId = +id;
        this.loadProjectCompteRendus();
      } else {
        this.loadAllCompteRendus();
      }
    });
  }

  loadProjectCompteRendus(): void {
    if (!this.projetId) return;
    
    this.isLoading = true;
    this.compteRenduService.getByProjet(this.projetId).subscribe({
      next: (data) => {
        this.compteRendus = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project compte rendus:', error);
        this.isLoading = false;
      }
    });
  }

  loadAllCompteRendus(): void {
    this.isLoading = true;
    this.compteRenduService.getAllCompteRendus().subscribe({
      next: (data) => {
        this.compteRendus = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading all compte rendus:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.compteRendus];
    
    if (this.selectedTypeFilter) {
      result = result.filter(cr => cr.fileType === this.selectedTypeFilter);
    }
    
    this.filteredCompteRendus = result;
    this.totalPages = Math.ceil(this.filteredCompteRendus.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedCompteRendus();
  }

  updatePaginatedCompteRendus(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredCompteRendus.length);
    this.paginatedCompteRendus = this.filteredCompteRendus.slice(startIndex, endIndex);
    
    // Load previews for photos
    setTimeout(() => {
      this.paginatedCompteRendus.forEach(compteRendu => {
        if (compteRendu.fileType === 'PHOTO') {
          this.loadPreview(compteRendu.id);
        }
      });
    }, 100);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedCompteRendus();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCompteRendus();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCompteRendus();
    }
  }

  clearFilters(): void {
    this.selectedTypeFilter = '';
    this.applyFilters();
  }

  openModal(): void {
    this.showModal = true;
    this.compteRenduForm.reset();
    this.selectedFile = null;
    this.fileRequired = false;
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
    
    if (this.compteRenduForm.valid && this.selectedFile && this.projetId) {
      this.isUploading = true;
      this.isLoading = true;
      const { titre, description, fileType } = this.compteRenduForm.value;
      
      this.compteRenduService.createCompteRendu(
        this.projetId,
        1, // TODO: Get actual user ID from auth service
        titre,
        description,
        fileType,
        this.selectedFile
      ).subscribe({
        next: (compteRendu) => {
          console.log('Compte rendu uploaded successfully:', compteRendu);
          this.loadProjectCompteRendus();
          this.closeModal();
          this.isUploading = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error uploading compte rendu:', error);
          this.isUploading = false;
          this.isLoading = false;
          alert(`Failed to upload compte rendu: ${error.status} ${error.statusText}`);
        }
      });
    } else {
      Object.keys(this.compteRenduForm.controls).forEach(key => {
        const control = this.compteRenduForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  viewFile(id: number): void {
    this.isLoading = true;
    this.compteRenduService.getFile(id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (error) => {
        console.error('Error viewing file:', error);
        this.isLoading = false;
        alert('Failed to view file');
      }
    });
  }

  downloadFile(id: number): void {
    this.isLoading = true;
    this.compteRenduService.getFile(id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        // Get the compte rendu to use its title for the filename
        const compteRendu = this.compteRendus.find(cr => cr.id === id);
        if (!compteRendu) return;
        
        // Create a safe filename
        const fileExtension = compteRendu.fileType === 'PHOTO' ? 'jpg' : 'mp4';
        const filename = `${compteRendu.titre.replace(/[^a-z0-9]/gi, '_')}.${fileExtension}`;
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.isLoading = false;
        alert('Failed to download file');
      }
    });
  }

  // Add a method to load image preview
  loadPreview(id: number): void {
    if (this.previewUrls[id]) return; // Already loaded
    
    this.compteRenduService.getFile(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.previewUrls[id] = url;
      },
      error: (error) => {
        console.error('Error loading preview:', error);
      }
    });
  }

  // Helper to get preview URL
  getPreviewUrl(id: number): string {
    return this.previewUrls[id] || '';
  }

  deleteCompteRendu(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte rendu?')) {
      this.isLoading = true;
      this.compteRenduService.deleteCompteRendu(id).subscribe({
        next: () => {
          this.loadProjectCompteRendus();
        },
        error: (error) => {
          console.error('Error deleting compte rendu:', error);
          this.isLoading = false;
          alert('Failed to delete compte rendu');
        }
      });
    }
  }

  getFileIcon(fileType: string): string {
    return fileType === 'PHOTO' ? 'fas fa-image' : 'fas fa-video';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  navigateToProjet(): void {
    this.router.navigate(['/projets']);
  }
  
  // Helper method for improved pagination display
  getPaginationRange(): number[] {
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(this.currentPage - 1, 2);
    let end = Math.min(this.currentPage + 1, this.totalPages - 1);
    
    // Adjust the range to show 3 pages
    if (end - start < 2) {
      if (start === 2) {
        end = Math.min(4, this.totalPages - 1);
      } else if (end === this.totalPages - 1) {
        start = Math.max(this.totalPages - 3, 2);
      }
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Clean up preview URLs on component destruction
  ngOnDestroy(): void {
    Object.values(this.previewUrls).forEach(url => {
      window.URL.revokeObjectURL(url);
    });
  }
}
