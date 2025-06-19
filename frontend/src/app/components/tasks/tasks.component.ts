import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, TacheDTO } from '../../services/tache.service';
import { Tache } from '../../models/tache.model';
import { Statut } from '../../enum/statut.enum';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { Projet } from '../../models/projet.model';
import { User } from '../../models/user.model';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { ProjetUserService, ProjetUserDTO } from '../../services/projet-user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Tache[] = [];
  todoTasks: Tache[] = [];
  inProgressTasks: Tache[] = [];
  doneTasks: Tache[] = [];
  showModal = false;
  isLoading = false;
  editingTask: Tache | null = null;
  taskForm: FormGroup;
  filteredTasks: Tache[] = [];
  searchQuery: string = '';
  Statut = Statut; // Make Statut enum available in template
  projects: Projet[] = [];
  projectUsers: { [key: number]: ProjetUserDTO[] } = {};
  currentUser: User | null = null;

  constructor(
    private tacheService: TacheService,
    private projetService: ProjetService,
    private userService: UserService,
    private projetUserService: ProjetUserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      description: ['', Validators.required],
      date: [''],
      statut: [Statut.A_FAIRE, Validators.required],
      projetId: ['', Validators.required],
      assigneeId: [{ value: '', disabled: true }, Validators.required]
    });

    // Subscribe to projetId changes to update available users
    this.taskForm.get('projetId')?.valueChanges.subscribe(projetId => {
      this.updateAvailableUsers(projetId);
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.loadUserProjects();
      },
      error: (error: any) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  loadUserProjects(): void {
    if (!this.currentUser) return;

    // Get all projects and filter based on user's role
    this.projetService.getAllProjects().subscribe({
      next: (allProjects: Projet[]) => {
        // Filter projects based on user's role
        this.projects = allProjects.filter(project => {
          // Add your project filtering logic here based on user roles
          return true; // For now, show all projects
        });
        
        // Load project users for each project
        this.projects.forEach(project => {
          this.loadProjectUsers(project.id);
        });

        // Load tasks after projects are loaded
        this.loadTasks();
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  loadProjectUsers(projetId: number): void {
    this.projetUserService.getProjectUsers(projetId).subscribe({
      next: (users) => {
        this.projectUsers[projetId] = users;
        console.log(`Loaded ${users.length} users for project ${projetId}:`, users);
        // If we're currently editing a task for this project, update the form
        if (this.editingTask && this.editingTask.projetId === projetId) {
          this.updateAvailableUsers(projetId);
        }
      },
      error: (error) => {
        console.error(`Error loading users for project ${projetId}:`, error);
        this.projectUsers[projetId] = []; // Ensure we have an empty array on error
      }
    });
  }

  updateAvailableUsers(projetId: number): void {
    const assigneeIdControl = this.taskForm.get('assigneeId');
    if (projetId) {
      assigneeIdControl?.enable();
      // Reset the assignee selection when project changes
      assigneeIdControl?.setValue('');
      const availableUsers = this.projectUsers[projetId] || [];
      console.log('Available users for project:', availableUsers);
    } else {
      assigneeIdControl?.disable();
    }
  }

  getAvailableUsersForProject(projetId: number): ProjetUserDTO[] {
    return this.projectUsers[projetId] || [];
  }

  isMaitreOeuvre(): boolean {
    return this.currentUser?.roles.some(role => role.name === 'ROLE_MAITRE_OEUVRE') ?? false;
  }

  loadTasks(): void {
    if (!this.currentUser) return;
    
    this.tacheService.getAllTaches().subscribe((tasks: Tache[]) => {
      // If user is MAITRE_OEUVRE, show all tasks, otherwise filter by assignee
      this.tasks = this.isMaitreOeuvre() 
        ? tasks 
        : tasks.filter(task => task.assigneeId === this.currentUser?.id);
      this.filteredTasks = [...this.tasks];
      this.updateTaskLists();
    });
  }

  updateTaskLists(): void {
    this.todoTasks = this.tasks.filter(task => task.statut === Statut.A_FAIRE);
    this.inProgressTasks = this.tasks.filter(task => task.statut === Statut.EN_COURS);
    this.doneTasks = this.tasks.filter(task => task.statut === Statut.TERMINE);
  }

  getTasksByStatus(status: Statut): Tache[] {
    return this.filteredTasks.filter(task => task.statut === status);
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredTasks = [...this.tasks];
      return;
    }
    this.filteredTasks = this.tasks.filter(task =>
      task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openModal(task?: Tache): void {
    this.editingTask = task || null;
    if (task) {
      // Ensure we have the project users loaded before setting the form values
      if (task.projetId && !this.projectUsers[task.projetId]) {
        this.loadProjectUsers(task.projetId);
      }
      
      this.taskForm.patchValue({
        description: task.description,
        date: task.date,
        statut: task.statut,
        projetId: task.projetId || '',
        assigneeId: task.assigneeId || ''
      });
      
      // Enable assigneeId if project is selected
      if (task.projetId) {
        this.taskForm.get('assigneeId')?.enable();
      }
    } else {
      this.taskForm.reset({
        statut: Statut.A_FAIRE
      });
      // Ensure assigneeId is disabled for new tasks
      this.taskForm.get('assigneeId')?.disable();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTask = null;
    this.taskForm.reset({
      statut: Statut.A_FAIRE
    });
    // Ensure assigneeId is disabled when modal is closed
    this.taskForm.get('assigneeId')?.disable();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.value;
      
      const taskData: TacheDTO = {
        description: formValue.description,
        date: formValue.date,
        statut: formValue.statut,
        projetId: formValue.projetId,
        assigneeId: formValue.assigneeId
      };

      if (this.editingTask) {
        this.tacheService.updateTache(this.editingTask.id, taskData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating tache:', error);
            this.isLoading = false;
          }
        });
      } else {
        this.tacheService.createTache(taskData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating tache:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      this.tacheService.deleteTache(id).subscribe({
        next: () => {
          this.loadTasks();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting tache:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onTaskDrop(event: CdkDragDrop<Tache[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const prevTask = event.previousContainer.data[event.previousIndex];
      const containerId = event.container.id;  // now guaranteed to be defined from HTML
      const newStatus = this.getStatusFromContainerId(containerId);

      const tacheDTO: TacheDTO = {
        description: prevTask.description,
        statut: newStatus,
        date: prevTask.date,
        projetId: prevTask.projetId,
        assigneeId: prevTask.assigneeId
      };

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.tacheService.updateTache(prevTask.id, tacheDTO).subscribe({
        next: () => { this.loadTasks(); },
        error: () => {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        }
      });
    }
  }

  private getStatusFromContainerId(containerId: string): Statut {
    switch (containerId) {
      case 'todoList':
        return Statut.A_FAIRE;
      case 'inProgressList':
        return Statut.EN_COURS;
      case 'doneList':
        return Statut.TERMINE;
      default:
        return Statut.A_FAIRE;
    }
  }
}