import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-bureau-suivi',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './bureau-suivi.component.html',
  styleUrls: ['./bureau-suivi.component.css']
})
export class BureauSuiviComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  bureauxSuivi: User[] = [];
  bureauSuiviRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingBureauSuivi: User | null = null;
  bureauSuiviForm: FormGroup;
  filteredBureauxSuivi: User[] = [];
  searchQuery: string = '';
  isEmailUnique: boolean = true;
  emailExistsError = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.bureauSuiviForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresse: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadBureauxSuivi();
    this.loadBureauSuiviRole();
  }

  loadBureauxSuivi(): void {
    this.userService.getBureauxSuivi().subscribe(users => {
      this.bureauxSuivi = users;
      this.filteredBureauxSuivi = [...users];
    });
  }

  loadBureauSuiviRole(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.bureauSuiviRoleId = roles.find(role => role.name === 'ROLE_BUREAU_ETUDE')?.id || null;
        if (!this.bureauSuiviRoleId) {
          console.error('Bureau de suivi role not found. Please ensure it exists in the backend.');
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onSearch(): void {
    this.filteredBureauxSuivi = this.bureauxSuivi.filter(bureauSuivi =>
      bureauSuivi.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      bureauSuivi.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  checkEmailUniqueness(email: string): boolean {
    // If editing a bureau, exclude the current bureau from the check
    if (this.editingBureauSuivi && this.editingBureauSuivi.email === email) {
      return true;
    }
    return !this.bureauxSuivi.some(bureau => 
      bureau.email.toLowerCase() === email.toLowerCase()
    );
  }

  onEmailChange(): void {
    const emailValue = this.bureauSuiviForm.get('email')?.value;
    if (emailValue && emailValue.trim() !== '') {
      this.isEmailUnique = this.checkEmailUniqueness(emailValue);
    } else {
      this.isEmailUnique = true; // Reset when email is empty
    }
  }

  openModal(bureauSuivi?: User): void {
    this.editingBureauSuivi = bureauSuivi || null;
    this.isEmailUnique = true;
    this.emailExistsError = false;
    
    if (bureauSuivi) {
      this.bureauSuiviForm.patchValue({
        nom: bureauSuivi.nom,
        email: bureauSuivi.email,
        telephone: bureauSuivi.telephone,
        adresse: bureauSuivi.adresse || '',
        password: ''
      });
    } else {
      this.bureauSuiviForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingBureauSuivi = null;
    this.bureauSuiviForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    this.emailExistsError = false;
    
    const emailValue = this.bureauSuiviForm.get('email')?.value;
    if (emailValue && !this.checkEmailUniqueness(emailValue)) {
      this.isEmailUnique = false;
      return;
    }
    
    if (this.bureauSuiviForm.valid) {
      this.isLoading = true;
      const bureauSuiviData = this.bureauSuiviForm.value;

      if (this.editingBureauSuivi) {
        const updatedData = { ...bureauSuiviData };
        // If password is empty, set it to the existing password
        if (!updatedData.password || updatedData.password.trim() === '') {
          updatedData.password = this.editingBureauSuivi.password;
        }
        
        this.userService.updateUser(this.editingBureauSuivi.id, updatedData).subscribe({
          next: () => {
            this.loadBureauxSuivi();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating bureau de suivi:', error);
            this.isLoading = false;
          }
        });
      } else {
        if (this.bureauSuiviRoleId) {
          const newBureauSuivi = {
            ...bureauSuiviData,
            roles: [{ id: this.bureauSuiviRoleId }]
          };

          this.userService.createUser(newBureauSuivi).subscribe({
            next: () => {
              this.loadBureauxSuivi();
              this.closeModal();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error creating bureau de suivi:', error);
              this.isLoading = false;
            }
          });
        } else {
          console.error('Bureau de suivi role ID not found.');
          this.isLoading = false;
        }
      }
    }
  }

  deleteBureauSuivi(id: number): void {
    if (confirm('Are you sure you want to delete this bureau de suivi?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadBureauxSuivi();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting bureau de suivi:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
