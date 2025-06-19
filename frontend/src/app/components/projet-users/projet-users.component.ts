import { Component, OnInit, Pipe, PipeTransform, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjetUserService, ProjetUserDTO } from '../../services/projet-user.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ERole } from '../../enum/role.enum';

@Pipe({
  name: 'roleLabel',
  standalone: true
})
export class RoleLabelPipe implements PipeTransform {
  transform(role: string): string {
    switch (role) {
      case 'ROLE_ENTREPRISE': return 'Entreprise';
      case 'ROLE_BUREAU_ETUDE': return 'Bureau d\'étude';
      case 'ROLE_MAITRE_OUVRAGE': return 'Maître d\'ouvrage';
      case 'ROLE_MAITRE_OEUVRE': return 'Maître d\'œuvre';
      case 'ROLE_CONTROLEUR_TECHNIQUE': return 'Contrôleur technique';
      case 'ROLE_SOUS_TRAITANT': return 'Sous-traitant';
      default: return role;
    }
  }
}

@Component({
  selector: 'app-projet-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, RoleLabelPipe],
  templateUrl: './projet-users.component.html',
  styleUrls: ['./projet-users.component.css']
})
export class ProjetUsersComponent implements OnInit {
  projectUsers: ProjetUserDTO[] = [];
  availableUsers: User[] = [];
  filteredUsers: User[] = [];
  assignmentForm: FormGroup;
  projetId!: number;
  showAddUserForm: boolean = false; // Add this property to toggle form visibility

  constructor(
    private route: ActivatedRoute,
    private projetUserService: ProjetUserService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.assignmentForm = this.fb.group({
      roleType: ['', Validators.required],
      userId: [{ value: '', disabled: true }, Validators.required] // Initialize as disabled
    });
  }

  ngOnInit() {
    this.projetId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProjectUsers();
    this.loadAvailableUsers();
  }

  loadProjectUsers() {
    this.projetUserService.getProjectUsers(this.projetId).subscribe({
      next: (users) => {
        this.projectUsers = users;
      },
      error: (error) => {
        console.error('Error loading project users:', error);
      }
    });
  }

  loadAvailableUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (error) => {
        console.error('Error loading available users:', error);
      }
    });
  }

  onRoleTypeChange() {
    const roleType = this.assignmentForm.get('roleType')?.value;
    if (roleType) {
      this.filteredUsers = this.availableUsers.filter(user => 
        user.roles.some(role => role.name === roleType)
      );
    } else {
      this.filteredUsers = [];
    }

    const userIdControl = this.assignmentForm.get('userId');
    if (this.filteredUsers.length > 0) {
      userIdControl?.enable(); // Enable if there are filtered users
    } else {
      userIdControl?.disable(); // Disable if no users match
    }
    userIdControl?.setValue(''); // Reset the value
  }

  // Toggle form visibility
  toggleAddUserForm() {
    this.showAddUserForm = !this.showAddUserForm;
    
    if (this.showAddUserForm) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      document.body.style.overflow = ''; // Restore scrolling
      this.assignmentForm.reset();
      this.filteredUsers = [];
    }
  }

  // Add this method to handle modal closing when ESC key is pressed
  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.showAddUserForm) {
      this.toggleAddUserForm();
    }
  }

  onSubmit() {
    if (this.assignmentForm.valid) {
      const { userId, roleType } = this.assignmentForm.value;
      this.projetUserService.assignUserToProject(this.projetId, userId, roleType as ERole).subscribe({
        next: () => {
          this.loadProjectUsers();
          this.assignmentForm.reset();
          this.filteredUsers = [];
          this.showAddUserForm = false;
          document.body.style.overflow = ''; // Restore scrolling
        },
        error: (error) => {
          console.error('Error assigning user to project:', error);
        }
      });
    }
  }

  removeUser(user: ProjetUserDTO) {
    if (confirm(`Are you sure you want to remove ${user.userNom} ${user.userPrenom} from this project?`)) {
      this.projetUserService.removeUserFromProject(this.projetId, user.userId, user.role).subscribe({
        next: () => {
          this.loadProjectUsers();
        },
        error: (error) => {
          console.error('Error removing user from project:', error);
        }
      });
    }
  }

  activateUser(user: ProjetUserDTO) {
    if (confirm(`Are you sure you want to activate ${user.userNom} ${user.userPrenom} in this project?`)) {
      this.projetUserService.activateUserInProject(this.projetId, user.userId).subscribe({
        next: () => {
          this.loadProjectUsers();
        },
        error: (error) => {
          console.error('Error activating user in project:', error);
        }
      });
    }
  }

  getRoleBadgeClass(role: ERole): string {
    switch (role) {
      case ERole.ROLE_ENTREPRISE:
        return 'badge-entreprise';
      case ERole.ROLE_BUREAU_ETUDE:
        return 'badge-bureau';
      case ERole.ROLE_MAITRE_OUVRAGE:
        return 'badge-maitre-ouvrage';
      case ERole.ROLE_MAITRE_OEUVRE:
        return 'badge-maitre-oeuvre';
      case ERole.ROLE_CONTROLEUR_TECHNIQUE:
        return 'badge-controleur';
      case ERole.ROLE_SOUS_TRAITANT:
        return 'badge-sous-traitant';
      default:
        return 'bg-secondary';
    }
  }
}