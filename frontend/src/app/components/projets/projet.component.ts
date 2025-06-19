import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from '../shared/notification/notification.component';
import { Projet } from '../../models/projet.model';
import { Status } from '../../enum/status.enum';
import { Category } from '../../enum/category.enum';
import { AuthService } from '../../services/auth.service';
import { ProjetUserService } from '../../services/projet-user.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { map, forkJoin } from 'rxjs';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.css']
})
export class ProjetComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  // Make Category enum accessible to the template
  Category = Category;
  
  projets: Projet[] = [];
  showModal = false;
  isLoading = false;
  editingProjet: Projet | null = null;
  projetForm: FormGroup;
  filteredProjets: Projet[] = [];
  searchQuery: string = '';
  currentUser: User | null = null;
  isAdmin: boolean = false;
  isMaitreOuvrage: boolean = false;
  readonly ADMIN_ROLE = 'ROLE_ADMIN';
  readonly MAITRE_OUVRAGE_ROLE = 'ROLE_MAITRE_OUVRAGE';
  
  // Category related properties
  categoryList = Object.values(Category);
  selectedCategory: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  paginatedProjets: Projet[] = [];

  // Add property to track which project is being archived
  archivingProjetId: number | null = null;
  showArchiveConfirm = false;

  constructor(
    private projetService: ProjetService,
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private projetUserService: ProjetUserService
  ) {
    this.projetForm = this.fb.group({
      nom: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      budget: ['', Validators.required],
      status: [''],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.hasRole(this.ADMIN_ROLE);
    this.isMaitreOuvrage = this.authService.hasRole(this.MAITRE_OUVRAGE_ROLE);
    
    
    this.loadProjets();
  }

  canManageProjects(): boolean {
    return this.isAdmin || this.isMaitreOuvrage;
  }

  loadProjets(): void {
    this.isLoading = true;
    this.projetService.getAllProjects().subscribe({
      next: (projets) => {
        if (this.isAdmin) {
          // Admin sees all projects
          this.projets = projets;
          this.filteredProjets = [...projets];
          this.updatePagination();
          this.isLoading = false;
        } else if (this.currentUser) {
          // Non-admin users only see their assigned projects
          this.filterProjectsByUser(projets, this.currentUser.id);
        } else {
          this.projets = projets;
          this.filteredProjets = [...projets];
          this.updatePagination();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.notificationService.error('Error loading projects');
        this.isLoading = false;
      }
    });
  }

  private filterProjectsByUser(projets: Projet[], userId: number): void {
    const projectChecks = projets.map(projet => 
      this.projetUserService.getProjectUsers(projet.id).pipe(
        map(users => ({
          projet,
          isAssigned: users.some(user => user.userId === userId)
        }))
      )
    );

    forkJoin(projectChecks).subscribe({
      next: (results) => {
        this.projets = results
          .filter(result => result.isAssigned)
          .map(result => result.projet);
        this.filteredProjets = [...this.projets];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking project assignments:', error);
        this.notificationService.error('Error loading project assignments');
        this.isLoading = false;
      }
    });
  }

  onCategoryFilterChange(): void {
    if (this.selectedCategory) {
      this.isLoading = true;
      this.projetService.getProjectsByCategory(this.selectedCategory as Category).subscribe({
        next: (projets) => {
          if (this.isAdmin) {
            // Admin sees all projects in the selected category
            this.filteredProjets = projets;
          } else if (this.currentUser) {
            // For non-admin users, filter by both category and user assignment
            this.filterProjectsByUser(projets, this.currentUser.id);
          }
          if (this.searchQuery) {
            this.filteredProjets = this.filteredProjets.filter(projet =>
              projet.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
          }
          this.currentPage = 1;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching projects by category:', error);
          this.isLoading = false;
          this.filteredProjets = [];
          this.updatePagination();
        }
      });
    } else {
      // If no category selected, load all projects and apply user filter if needed
      this.loadProjets();
    }
  }

  onSearch(): void {
    this.isLoading = true;
    if (this.selectedCategory) {
      // If category is selected, get projects by category first
      this.projetService.getProjectsByCategory(this.selectedCategory as Category).subscribe({
        next: (projets) => {
          if (this.isAdmin) {
            // Admin sees all projects in the category
            this.filteredProjets = projets.filter(projet =>
              projet.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
          } else if (this.currentUser) {
            // For non-admin users, filter by both category and user assignment
            this.filterProjectsByUserAndSearch(projets, this.currentUser.id);
          }
          this.currentPage = 1;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching projects by category:', error);
          this.isLoading = false;
          this.filteredProjets = [];
          this.updatePagination();
        }
      });
    } else {
      // If no category selected, use current projects list
      if (this.isAdmin) {
        // Admin sees all projects
        this.filteredProjets = this.projets.filter(projet =>
          projet.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
      } else if (this.currentUser) {
        // For non-admin users, filter by user assignment and search
        this.filterProjectsByUserAndSearch(this.projets, this.currentUser.id);
      }
    }
  }

  private filterProjectsByUserAndSearch(projets: Projet[], userId: number): void {
    const projectChecks = projets.map(projet => 
      this.projetUserService.getProjectUsers(projet.id).pipe(
        map(users => ({
          projet,
          isAssigned: users.some(user => user.userId === userId)
        }))
      )
    );

    forkJoin(projectChecks).subscribe({
      next: (results) => {
        this.filteredProjets = results
          .filter(result => result.isAssigned)
          .map(result => result.projet)
          .filter(projet =>
            projet.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking project assignments:', error);
        this.notificationService.error('Error loading project assignments');
        this.isLoading = false;
        this.filteredProjets = [];
        this.updatePagination();
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProjets.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProjets = this.filteredProjets.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  openModal(projet?: Projet): void {
    this.editingProjet = projet || null;
    this.projetForm.reset();
    
    if (projet) {
      console.log('Editing project with category:', projet.category);
      
      this.projetForm.patchValue({
        nom: projet.nom,
        dateDebut: this.formatDateForInput(projet.dateDebut),
        dateFin: this.formatDateForInput(projet.dateFin),
        budget: projet.budget,
        status: projet.status,
        category: projet.category
      });
      
      setTimeout(() => {
        console.log('Form values after patch:', this.projetForm.value);
        console.log('Category control value:', this.projetForm.get('category')?.value);
      }, 0);
    } else {
      this.projetForm.patchValue({
        status: 'PLANIFIE',
        category: ''
      });
    }
    
    this.showModal = true;
  }

  private formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
      return '';
    }
    return date.toISOString().split('T')[0];
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProjet = null;
    this.projetForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      this.isLoading = true;
      
      // Create a copy of the form data
      const projetData = {...this.projetForm.value};
      
      // Ensure the category is properly set in the request payload
      if (!projetData.category) {
        this.notificationService.error('Veuillez sélectionner une catégorie');
        this.isLoading = false;
        return;
      }
      
      if (this.editingProjet) {
        this.projetService.updateProject(this.editingProjet.id, projetData).subscribe({
          next: (updatedProjet) => {
            this.notificationService.success(`Le projet "${updatedProjet.nom}" a été mis à jour avec succès`);
            this.loadProjets();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating projet:', error);
            this.notificationService.error(`Échec de la mise à jour: ${error.message || 'Erreur inconnue'}`);
            this.isLoading = false;
          }
        });
      } else {
        this.projetService.createProject(projetData).subscribe({
          next: (newProjet) => {
            this.notificationService.success(`Le projet "${newProjet.nom}" a été créé avec succès`);
            this.loadProjets();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating projet:', error);
            this.notificationService.error(`Échec de la création: ${error.message || 'Erreur inconnue'}`);
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.keys(this.projetForm.controls).forEach(key => {
        const control = this.projetForm.get(key);
        control?.markAsTouched();
      });
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
    }
  }

  archiveProjet(id: number): void {
    // Open the custom confirmation dialog instead of using browser confirm
    this.archivingProjetId = id;
    this.showArchiveConfirm = true;
  }

  confirmArchive(): void {
    if (this.archivingProjetId) {
      this.isLoading = true;
      this.projetService.archiveProject(this.archivingProjetId).subscribe({
        next: (response) => {
          // Successfully archived
          this.notificationService.success('Projet archivé avec succès');
          this.loadProjets();
          this.isLoading = false;
          this.cancelArchive();
        },
        error: (error) => {
          // Check if it's actually a success but with text response parsing error
          if (error.status === 200 && error.error.text) {
            // This was actually a success but Angular couldn't parse the response as JSON
            this.notificationService.success('Projet archivé avec succès');
            this.loadProjets();
            this.isLoading = false;
            this.cancelArchive();
          } else {
            // This is a real error
            console.error('Error archiving projet:', error);
            this.notificationService.error(`Échec de l'archivage: ${error.message || 'Erreur inconnue'}`);
            this.isLoading = false;
            this.cancelArchive();
          }
        }
      });
    }
  }

  cancelArchive(): void {
    this.showArchiveConfirm = false;
    this.archivingProjetId = null;
  }

  viewDocuments(projetId: number): void {
    this.router.navigate(['/projets', projetId, 'documents']);
  }
  
  navigateToUsers(projetId: number): void {
    this.router.navigate(['/projets', projetId, 'users']);
  }
  
  // Add method to navigate to compte rendu
  navigateToCompteRendu(projetId: number): void {
    
    this.router.navigate(['/projets', projetId, 'compte-rendus']);
  }
  
  // Add resetFilters method to clear search and category filters
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.loadProjets(); // Reset to all projects
    this.currentPage = 1; // Reset to first page
  }
}
