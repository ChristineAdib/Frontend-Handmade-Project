import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../Services/auth';
import { LanguageService } from '../../../../../core/services/language.service';
import { environment } from '../../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  auth           = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  showPass  = signal(false);

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  togglePass() { this.showPass.update(v => !v); }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);

    this.auth.login(this.loginForm.value as any).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) this.router.navigate(['/']);
        else this.auth.errorMsg.set(res.errors?.[0] ?? 'Login failed.');
      },
      error: err => {
        this.isLoading.set(false);
        this.auth.errorMsg.set(err.error?.errors?.[0] ?? 'Login failed.');
      }
    });
  }

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(checkGoogle);
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: this.handleGoogleCredential.bind(this)
        });
        google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '380' }
        );
      }
    }, 100);
    setTimeout(() => clearInterval(checkGoogle), 5000);
  }

  private handleGoogleCredential(response: any) {
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);

    this.auth.loginWithGoogle(response.credential).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.auth.errorMsg.set(res.errors?.[0] ?? 'Google authentication failed.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.auth.errorMsg.set(err.error?.errors?.[0] ?? 'Google authentication failed.');
      }
    });
  }
}