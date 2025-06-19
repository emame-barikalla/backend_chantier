import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
//import { UsersComponent } from './components/users/users.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ProjetComponent } from './components/projets/projet.component';
import { EntrepriseComponent } from './components/entreprises/entreprise.component';
import { ClientComponent } from './components/clients/client.component';
import { BureauSuiviComponent } from './components/bureau-suivi/bureau-suivi.component';
import { RolesComponent } from './components/roles/roles.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { ArchiveComponent } from './components/archive/archive.component';
import { MaitreOeuvreComponent } from './components/maitres-oeuvres/maitre-oeuvre.component';
import { ProjetUsersComponent } from './components/projet-users/projet-users.component';
import { SousTraitantComponent } from './components/sous-traitants/sous-traitant.component';
import { ControleurComponent } from './components/controleurs/controleur.component';
import { DocumentComponent } from './components/documents/document.component';
import { DocumentDetailsComponent } from './components/document-details/document-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      
      { path: 'clients', component: ClientComponent },
      {path:'roles',component:RolesComponent },
      {path: 'archives', component: ArchiveComponent },
      {path: 'documents', component: DocumentComponent },
      {path: 'documents/:id', component: DocumentDetailsComponent },
      {path: 'projets/:id/documents', loadComponent: () => import('./components/documents/document.component').then(m => m.DocumentComponent) },
      {path: 'compte-rendus', loadComponent: () => import('./components/compte-rendus/compte-rendu.component').then(m => m.CompteRenduComponent) },
      {path: 'projets/:id/compte-rendus', loadComponent: () => import('./components/compte-rendus/compte-rendu.component').then(m => m.CompteRenduComponent) },
      {path:'entreprises', component:EntrepriseComponent},
      {path:'bureau-suivi',component:BureauSuiviComponent},
      { path: 'maitres-oeuvres', component: MaitreOeuvreComponent },
      {path: 'sous-traitants',component:SousTraitantComponent},
      {path:'controleurs',component:ControleurComponent},
      { path: 'projets', component: ProjetComponent },
      {path:'tasks',component:TasksComponent},
      { path: 'profile', loadComponent: () => import('./components/profile/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'change-password', loadComponent: () => import('./components/profile/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
      { path: 'projets/:id/users', component: ProjetUsersComponent },
      
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];
