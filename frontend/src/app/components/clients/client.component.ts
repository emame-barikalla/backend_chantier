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

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['']
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

  openModal(client?: User): void {
    this.editingClient = client || null;
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
    if (this.clientForm.valid) {
      this.isLoading = true;
      const clientData = this.clientForm.value;

      if (this.editingClient) {
        const updatedData = { ...clientData };
        
        // If password is empty, set it to the existing password
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
            console.error('Error updating client:', error);
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
              console.error('Error creating client:', error);
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
