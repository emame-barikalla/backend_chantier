import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoleService, RoleDTO } from '../../services/role.service';
import { PermissionService } from '../../services/permission.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  @ViewChild('modal') modalRef!: ElementRef;
  roles: Role[] = [];
  permissionsMap: { [key: number]: Permission[] } = {};
  showPermissions: { [key: number]: boolean } = {};
  loading = false;
  error: string | null = null;
  isModalOpen = false;
  newRole: RoleDTO = { name: '', description: '', permissions: [] };
  editingRole: Role | null = null;
  isAdmin = false;
  readonly ADMIN_ROLE = 'ROLE_ADMIN';

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.checkAdminStatus();
  }

  /**
   * Check if the current user has admin privileges
   * This is used to control UI elements visibility
   */
  private checkAdminStatus(): void {
    this.isAdmin = this.authService.hasRole(this.ADMIN_ROLE);
  }

  /**
   * Check if the current user can perform administrative actions
   * @returns boolean indicating if user has admin rights
   */
  canPerformAdminActions(): boolean {
    return this.isAdmin;
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
        this.roles.forEach((role) => {
          this.showPermissions[role.id] = false;
          if (!role.permissions) {
            this.loadPermissionsForRole(role.id);
          } else {
            this.permissionsMap[role.id] = role.permissions;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load roles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadPermissionsForRole(roleId: number): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissionsMap[roleId] = permissions; // Filter if needed
      },
      error: (err) => {
        console.error(`Failed to load permissions for role ${roleId}`, err);
      }
    });
  }

  togglePermissions(roleId: number): void {
    this.showPermissions[roleId] = !this.showPermissions[roleId];
  }

  openAddRoleModal(): void {
    if (!this.canPerformAdminActions()) {
      console.warn('Non-admin user attempted to add a role');
      return;
    }
    
    this.newRole = { name: '', description: '', permissions: [] };
    this.editingRole = null;
    this.isModalOpen = true;
  }

  openEditRoleModal(role: Role): void {
    if (!this.canPerformAdminActions()) {
      console.warn('Non-admin user attempted to edit a role');
      return;
    }
    
    this.newRole = { 
      name: role.name, 
      description: role.description || '', 
      permissions: role.permissions || [] 
    };
    this.editingRole = role;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingRole = null;
  }

  onModalClick(event: MouseEvent): void {
    if (event.target === this.modalRef.nativeElement) {
      this.closeModal();
    }
  }

  addRole(): void {
    // Additional security check before saving
    if (!this.canPerformAdminActions()) {
      console.error('Unauthorized attempt to modify roles');
      this.error = 'You do not have permission to perform this action';
      return;
    }
    
    if (this.editingRole) {
      this.roleService.updateRole(this.editingRole.id, this.newRole).subscribe({
        next: (updatedRole) => {
          const index = this.roles.findIndex((r) => r.id === updatedRole.id);
          if (index !== -1) {
            this.roles[index] = updatedRole;
          }
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to update role';
          console.error(err);
        }
      });
    } else {
      this.roleService.createRole(this.newRole).subscribe({
        next: (role) => {
          this.roles.push(role);
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Failed to add role';
          console.error(err);
        }
      });
    }
  }

  deleteRole(roleId: number): void {
    // Only allow admins to delete roles
    if (!this.canPerformAdminActions()) {
      console.warn('Non-admin user attempted to delete a role');
      this.error = 'You do not have permission to perform this action';
      return;
    }
    
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          this.roles = this.roles.filter((role) => role.id !== roleId);
          delete this.permissionsMap[roleId];
          delete this.showPermissions[roleId];
        },
        error: (err) => {
          this.error = 'Failed to delete role';
          console.error(err);
        }
      });
    }
  }

  getFormattedRoleName(roleName: string): string {
    return roleName.replace(/^role_/i, '');
  }
}