import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetService } from '../../services/projet.service';
import { DocumentService } from '../../services/document.service';
import { Projet } from '../../models/projet.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  searchQuery: string = '';
  archivedProjets: Projet[] = [];
  filteredProjets: Projet[] = [];
  paginatedProjets: Projet[] = [];
  isLoading: boolean = true;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;

  constructor(
    private projetService: ProjetService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchArchivedProjects();
  }

  fetchArchivedProjects(): void {
    this.projetService.getArchivedProjects().subscribe({
      next: (projets) => {
        this.archivedProjets = projets;
        this.filteredProjets = [...projets];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching archived projects:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.filteredProjets = this.archivedProjets.filter(projet =>
      projet.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1;
    this.updatePagination();
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

  viewDocuments(projetId: number): void {
    this.router.navigate(['/projets', projetId, 'documents'], {
      queryParams: { from: 'archive' }
    });
  }
}