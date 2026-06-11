import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  protected auth = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  showPass  = signal(false);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    // Read parameters from URL query strings
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm.patchValue({ email, token });
  }

  togglePass() { this.showPass.update(v => !v); }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) return;
    this.isLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const model = {
      email: this.resetForm.value.email!,
      token: this.resetForm.value.token!,
      newPassword: this.resetForm.value.newPassword!,
      confirmPassword: this.resetForm.value.confirmPassword!
    };

    this.auth.resetPassword(model).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.successMsg.set(res.message || 'Password has been reset successfully.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMsg.set(res.errors?.[0] ?? 'An error occurred.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.errors?.[0] ?? 'An error occurred.');
      }
    });
  }
}
