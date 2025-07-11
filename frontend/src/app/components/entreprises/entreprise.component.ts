import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entreprise.component.html',
  styleUrls: ['./entreprise.component.css']
})
export class EntrepriseComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  entreprises: User[] = [];
  entrepriseRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingEntreprise: User | null = null;
  entrepriseForm: FormGroup;
  filteredEntreprises: User[] = [];
  searchQuery: string = '';
  isEmailUnique: boolean = true;
  emailExistsError = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.entrepriseForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''], // Kept adresse field
      password: [''] // Password is optional for editing
    });
  }

  ngOnInit(): void {
    this.loadEntreprises();
    this.loadEntrepriseRole();
  }

  loadEntreprises(): void {
    this.userService.getEntreprises().subscribe(users => {
      this.entreprises = users;
      this.filteredEntreprises = [...users]; // Initialize filtered list
    });
  }

  loadEntrepriseRole(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.entrepriseRoleId = roles.find(role => role.name === 'ROLE_ENTREPRISE')?.id || null;
        if (!this.entrepriseRoleId) {
          console.error('Entreprise role not found. Please ensure it exists in the backend.');
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onSearch(): void {
    this.filteredEntreprises = this.entreprises.filter(entreprise =>
      entreprise.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      entreprise.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  checkEmailUniqueness(email: string): boolean {
    // If editing an entreprise, exclude the current entreprise from the check
    if (this.editingEntreprise && this.editingEntreprise.email === email) {
      return true;
    }
    return !this.entreprises.some(entreprise => 
      entreprise.email.toLowerCase() === email.toLowerCase()
    );
  }

  onEmailChange(): void {
    const emailValue = this.entrepriseForm.get('email')?.value;
    if (emailValue && emailValue.trim() !== '') {
      this.isEmailUnique = this.checkEmailUniqueness(emailValue);
    } else {
      this.isEmailUnique = true; // Reset when email is empty
    }
  }

  openModal(entreprise?: User): void {
    this.editingEntreprise = entreprise || null;
    this.isEmailUnique = true;
    this.emailExistsError = false;
    if (entreprise) {
      this.entrepriseForm.patchValue({
        nom: entreprise.nom,
        email: entreprise.email,
        telephone: entreprise.telephone,
        adresse: entreprise.adresse || '',
        password: '' // Leave password empty unless changed
      });
    } else {
      this.entrepriseForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEntreprise = null;
    this.entrepriseForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    this.emailExistsError = false;
    
    const emailValue = this.entrepriseForm.get('email')?.value;
    if (emailValue && !this.checkEmailUniqueness(emailValue)) {
      this.isEmailUnique = false;
      return;
    }
    
    if (this.entrepriseForm.valid) {
      this.isLoading = true;
      const entrepriseData = this.entrepriseForm.value;

      if (this.editingEntreprise) {
        const updatedData = { ...entrepriseData };
        // If password is empty, set it to the existing password
        if (!updatedData.password || updatedData.password.trim() === '') {
          updatedData.password = this.editingEntreprise.password;
        }

        this.userService.updateUser(this.editingEntreprise.id, updatedData).subscribe({
          next: () => {
            this.loadEntreprises();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating entreprise:', error);
            this.isLoading = false;
          }
        });
      } else {
        if (this.entrepriseRoleId) {
          const newEntreprise = {
            ...entrepriseData,
            roles: [{ id: this.entrepriseRoleId }]
          };

          this.userService.createUser(newEntreprise).subscribe({
            next: () => {
              this.loadEntreprises();
              this.closeModal();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error creating entreprise:', error);
              this.isLoading = false;
            }
          });
        } else {
          console.error('Entreprise role ID not found.');
          this.isLoading = false;
        }
      }
    }
  }

  deleteEntreprise(id: number): void {
    if (confirm('Are you sure you want to delete this entreprise?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadEntreprises();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting entreprise:', error);
          this.isLoading = false;
        }
      });
    }
  }
}