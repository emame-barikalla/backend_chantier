import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  clients: User[] = [];
  clientRoleId: number | null = null;
  showModal = false;
  isLoading = false;
  editingClient: User | null = null;
  clientForm: FormGroup;
  filteredClients: User[] = [];
  searchQuery: string = '';
  emailExistsError = false;
  isEmailUnique: boolean = true;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{8,}$/) // Only numbers, at least 8 digits
        ]
      ],
      adresse: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadClientRole();
  }

  loadClients(): void {
    this.userService.getClients().subscribe(users => {
      this.clients = users;
      this.filteredClients = [...users];
    });
  }

  loadClientRole(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.clientRoleId = roles.find(role => role.name === 'ROLE_MAITRE_OUVRAGE')?.id || null;
        if (!this.clientRoleId) {
          console.error('Client role not found. Please ensure it exists in the backend.');
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onSearch(): void {
    this.filteredClients = this.clients.filter(client =>
      client.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  checkEmailUniqueness(email: string): boolean {
    // If editing a client, exclude the current client from the check
    if (this.editingClient && this.editingClient.email === email) {
      return true;
    }
    return !this.clients.some(client => 
      client.email.toLowerCase() === email.toLowerCase()
    );
  }

  onEmailChange(): void {
    const emailValue = this.clientForm.get('email')?.value;
    if (emailValue && emailValue.trim() !== '') {
      this.isEmailUnique = this.checkEmailUniqueness(emailValue);
    } else {
      this.isEmailUnique = true; // Reset when email is empty
    }
  }

  openModal(client?: User): void {
    this.editingClient = client || null;
    this.isEmailUnique = true;
    if (client) {
      this.clientForm.patchValue({
        nom: client.nom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse || '',
        password: ''
      });
    } else {
      this.clientForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingClient = null;
    this.clientForm.reset();
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    this.emailExistsError = false;
    
    const emailValue = this.clientForm.get('email')?.value;
    if (emailValue && !this.checkEmailUniqueness(emailValue)) {
      this.isEmailUnique = false;
      return;
    }
    
    if (this.clientForm.valid) {
      this.isLoading = true;
      const clientData = this.clientForm.value;

      if (this.editingClient) {
        const updatedData = { ...clientData };
        if (!updatedData.password || updatedData.password.trim() === '') {
          updatedData.password = this.editingClient.password;
        }
        this.userService.updateUser(this.editingClient.id, updatedData).subscribe({
          next: () => {
            this.loadClients();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            if (error?.error?.message?.includes('email')) {
              this.emailExistsError = true;
            }
            this.isLoading = false;
          }
        });
      } else {
        if (this.clientRoleId) {
          const newClient = {
            ...clientData,
            roles: [{ id: this.clientRoleId }]
          };
          this.userService.createUser(newClient).subscribe({
            next: () => {
              this.loadClients();
              this.closeModal();
              this.isLoading = false;
            },
            error: (error) => {
              if (error?.error?.message?.includes('email')) {
                this.emailExistsError = true;
              }
              this.isLoading = false;
            }
          });
        } else {
          console.error('Client role ID not found.');
          this.isLoading = false;
        }
      }
    }
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadClients();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
