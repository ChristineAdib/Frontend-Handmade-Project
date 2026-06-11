import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.isLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const email = this.forgotForm.value.email!;

    this.auth.forgotPassword(email).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.successMsg.set(res.message || 'If an account with that email exists, we sent a password reset link to it.');
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
