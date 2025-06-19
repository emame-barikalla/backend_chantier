import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-controleurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './controleur.component.html',
  styleUrls: ['./controleur.component.css']
})
export class ControleurComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  controleurs: User[] = [];
  controleurRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingControleur: User | null = null;
  controleurForm: FormGroup;
  filteredControleurs: User[] = [];
  searchQuery: string = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.controleurForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadControleurs();
    this.loadControleurRole();
  }

  loadControleurs(): void {
    this.isLoading = true;
    this.userService.getControlleurs().subscribe({
      next: (users) => {
        this.controleurs = users;
        this.filteredControleurs = [...users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading controleurs:', error);
        this.isLoading = false;
      }
    });
  }

  loadControleurRole(): void {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        const controleurRole = roles.find(role => role.name === 'ROLE_CONTROLEUR_TECHNIQUE');
        if (controleurRole) {
          this.controleurRoleId = controleurRole.id;
        } else {
          console.error('Contrôleur technique role not found. Please ensure it exists in the backend.');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredControleurs = [...this.controleurs];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredControleurs = this.controleurs.filter(controleur =>
      (controleur.nom?.toLowerCase().includes(query) || false) ||
      (controleur.email?.toLowerCase().includes(query) || false) ||
      (controleur.telephone?.toLowerCase().includes(query) || false)
    );
  }

  openModal(controleur?: User): void {
    this.editingControleur = controleur || null;
    if (controleur) {
      this.controleurForm.patchValue({
        nom: controleur.nom,
        email: controleur.email,
        telephone: controleur.telephone,
        adresse: controleur.adresse || '',
        password: ''
      });
    } else {
      this.controleurForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingControleur = null;
    this.controleurForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.controleurForm.valid) {
      this.isLoading = true;
      const controleurData = this.controleurForm.value;

      if (this.editingControleur) {
        const updatedData = { ...controleurData };
        if (!updatedData.password || updatedData.password.trim() === '') {
          updatedData.password = this.editingControleur.password;
        }

        this.userService.updateUser(this.editingControleur.id, updatedData).subscribe({
          next: () => {
            this.loadControleurs();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating contrôleur technique:', error);
            this.isLoading = false;
          }
        });
      } else {
        if (!this.controleurRoleId) {
          console.error('Contrôleur technique role ID not found.');
          this.roleService.getAllRoles().subscribe({
            next: (roles) => {
              const controleurRole = roles.find(role => role.name === 'ROLE_CONTROLEUR_TECHNIQUE');
              if (controleurRole) {
                this.controleurRoleId = controleurRole.id;
                this.createControleur(controleurData);
              } else {
                alert('Erreur: Le rôle "Contrôleur technique" est introuvable dans le système.');
                this.isLoading = false;
              }
            },
            error: (error) => {
              console.error('Error reloading roles:', error);
              this.isLoading = false;
              alert('Erreur lors du chargement des rôles.');
            }
          });
        } else {
          this.createControleur(controleurData);
        }
      }
    }
  }

  // Helper method to create controleur
  private createControleur(controleurData: any): void {
    const newControleur = {
      ...controleurData,
      roles: [{ id: this.controleurRoleId }]
    };

    this.userService.createUser(newControleur).subscribe({
      next: () => {
        this.loadControleurs();
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating contrôleur technique:', error);
        this.isLoading = false;
        if (error.status === 400 && error.error && error.error.message) {
          alert(`Erreur: ${error.error.message}`);
        } else {
          alert('Erreur lors de la création du contrôleur.');
        }
      }
    });
  }

  deleteControleur(id: number): void {
    if (confirm('Are you sure you want to delete this contrôleur technique?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadControleurs();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting contrôleur technique:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
