import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-maitres-oeuvres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './maitre-oeuvre.component.html',
  styleUrls: ['./maitre-oeuvre.component.css']
})
export class MaitreOeuvreComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  maitresOeuvres: User[] = [];
  maitreOeuvreRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingMaitreOeuvre: User | null = null;
  maitreOeuvreForm: FormGroup;
  filteredMaitresOeuvres: User[] = [];
  searchQuery: string = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.maitreOeuvreForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadMaitresOeuvres();
    this.loadMaitreOeuvreRole();
  }

  loadMaitresOeuvres(): void {
    this.userService.getMaitresOeuvres().subscribe(users => {
      this.maitresOeuvres = users;
      this.filteredMaitresOeuvres = [...users];
    });
  }

  loadMaitreOeuvreRole(): void {
    // Use getAllRoles to ensure all roles are available
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.maitreOeuvreRoleId = roles.find(role => role.name === 'ROLE_MAITRE_OEUVRE')?.id || null;
        if (!this.maitreOeuvreRoleId) {
          console.error('Maître d\'œuvre role not found. Please ensure it exists in the backend.');
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onSearch(): void {
    this.filteredMaitresOeuvres = this.maitresOeuvres.filter(maitreOeuvre =>
      maitreOeuvre.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      maitreOeuvre.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openModal(maitreOeuvre?: User): void {
    this.editingMaitreOeuvre = maitreOeuvre || null;
    if (maitreOeuvre) {
      this.maitreOeuvreForm.patchValue({
        nom: maitreOeuvre.nom,
        email: maitreOeuvre.email,
        telephone: maitreOeuvre.telephone,
        adresse: maitreOeuvre.adresse || '',
        password: ''
      });
    } else {
      this.maitreOeuvreForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingMaitreOeuvre = null;
    this.maitreOeuvreForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.maitreOeuvreForm.valid) {
      this.isLoading = true;
      const maitreOeuvreData = this.maitreOeuvreForm.value;

      if (this.editingMaitreOeuvre) {
        const updatedData = { ...maitreOeuvreData };
        if (!updatedData.password || updatedData.password.trim() === '') {
          updatedData.password = this.editingMaitreOeuvre.password;
        }

        this.userService.updateUser(this.editingMaitreOeuvre.id, updatedData).subscribe({
          next: () => {
            this.loadMaitresOeuvres();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating maître d\'œuvre:', error);
            this.isLoading = false;
          }
        });
      } else {
        if (this.maitreOeuvreRoleId) {
          const newMaitreOeuvre = {
            ...maitreOeuvreData,
            roles: [{ id: this.maitreOeuvreRoleId }]
          };

          this.userService.createUser(newMaitreOeuvre).subscribe({
            next: () => {
              this.loadMaitresOeuvres();
              this.closeModal();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error creating maître d\'œuvre:', error);
              this.isLoading = false;
            }
          });
        } else {
          console.error('Maître d\'œuvre role ID not found.');
          this.isLoading = false;
        }
      }
    }
  }

  deleteMaitreOeuvre(id: number): void {
    if (confirm('Are you sure you want to delete this maître d\'œuvre?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadMaitresOeuvres();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting maître d\'œuvre:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
