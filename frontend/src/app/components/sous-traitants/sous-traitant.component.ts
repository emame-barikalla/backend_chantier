import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sous-traitants',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sous-traitant.component.html',
  styleUrls: ['./sous-traitant.component.css']
})
export class SousTraitantComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  sousTraitants: User[] = [];
  sousTraitantRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingSousTraitant: User | null = null;
  sousTraitantForm: FormGroup;
  filteredSousTraitants: User[] = [];
  searchQuery: string = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.sousTraitantForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadSousTraitants();
    this.loadSousTraitantRole();
  }

  loadSousTraitants(): void {
    this.isLoading = true;
    this.userService.getSousTraitants().subscribe({
      next: (users) => {
        this.sousTraitants = users;
        this.filteredSousTraitants = [...users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sous-traitants:', error);
        this.isLoading = false;
      }
    });
  }

  loadSousTraitantRole(): void {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.sousTraitantRoleId = roles.find(role => role.name === 'ROLE_SOUS_TRAITANT')?.id || null;
        if (!this.sousTraitantRoleId) {
          console.error('Sous-traitant role not found. Please ensure it exists in the backend.');
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
      this.filteredSousTraitants = [...this.sousTraitants];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredSousTraitants = this.sousTraitants.filter(sousTraitant =>
      (sousTraitant.nom?.toLowerCase().includes(query) || false) ||
      (sousTraitant.email?.toLowerCase().includes(query) || false) ||
      (sousTraitant.telephone?.toLowerCase().includes(query) || false)
    );
  }

  openModal(sousTraitant?: User): void {
    this.editingSousTraitant = sousTraitant || null;
    if (sousTraitant) {
      this.sousTraitantForm.patchValue({
        nom: sousTraitant.nom,
        email: sousTraitant.email,
        telephone: sousTraitant.telephone,
        adresse: sousTraitant.adresse || '',
        password: ''
      });
      this.sousTraitantForm.get('password')?.setValidators(null);
    } else {
      this.sousTraitantForm.reset();
      this.sousTraitantForm.get('password')?.setValidators([Validators.required]);
    }
    this.sousTraitantForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSousTraitant = null;
    this.sousTraitantForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.sousTraitantForm.valid) {
      this.isLoading = true;
      const sousTraitantData = { ...this.sousTraitantForm.value };

      if (this.editingSousTraitant) {
        // If password is empty and we're editing, don't update password
        if (!sousTraitantData.password || sousTraitantData.password.trim() === '') {
          delete sousTraitantData.password;
        }

        this.userService.updateUser(this.editingSousTraitant.id, sousTraitantData).subscribe({
          next: () => {
            this.loadSousTraitants();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating sous-traitant:', error);
            this.isLoading = false;
          }
        });
      } else {
        if (this.sousTraitantRoleId) {
          const newSousTraitant = {
            ...sousTraitantData,
            roles: [{ id: this.sousTraitantRoleId }]
          };

          this.userService.createUser(newSousTraitant).subscribe({
            next: () => {
              this.loadSousTraitants();
              this.closeModal();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error creating sous-traitant:', error);
              this.isLoading = false;
            }
          });
        } else {
          console.error('Sous-traitant role ID not found.');
          this.isLoading = false;
        }
      }
    }
  }

  deleteSousTraitant(id: number): void {
    if (confirm('Are you sure you want to delete this sous-traitant?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadSousTraitants();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting sous-traitant:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
