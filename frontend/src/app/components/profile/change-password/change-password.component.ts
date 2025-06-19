import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.success = 'mot de passe changé avec succès';
          this.passwordForm.reset();
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 400 && err.error?.message?.includes('current password')) {
            this.error = 'Current password is incorrect';
            this.passwordForm.get('currentPassword')?.setErrors({ incorrectPassword: true });
          } else {
            this.error = err.error?.message || 'Failed to change password';
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
} 