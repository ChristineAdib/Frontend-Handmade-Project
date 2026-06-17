import { Component, inject, signal, AfterViewInit, OnInit } from '@angular/core';
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
}
)
export class LoginComponent implements AfterViewInit, OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  auth           = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  showPass  = signal(false);

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  ngOnInit() {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  togglePass() { this.showPass.update(v => !v); }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);

    const email = this.loginForm.value.email;
    const remember = this.loginForm.value.rememberMe;

    this.auth.login(this.loginForm.value as any).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          if (remember && email) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }
          this.router.navigate(['/']);
        }
        else {
          const msg = this.auth.extractError(res, 'Login failed.');
          this.auth.errorMsg.set(this.getLocalizedError(msg));
        }
      },
      error: err => {
        this.isLoading.set(false);
        const msg = this.auth.extractError(err, 'Login failed.');
        this.auth.errorMsg.set(this.getLocalizedError(msg));
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
          const msg = this.auth.extractError(res, 'Google authentication failed.');
          this.auth.errorMsg.set(this.getLocalizedError(msg));
        }
      },
      error: err => {
        this.isLoading.set(false);
        const msg = this.auth.extractError(err, 'Google authentication failed.');
        this.auth.errorMsg.set(this.getLocalizedError(msg));
      }
    });
  }

  private getLocalizedError(msg: string): string {
    const isAr = this.langService.currentLang() === 'ar';
    const lower = msg.toLowerCase();
    if (lower.includes('invalid email or password')) {
      return isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.';
    }
    if (lower.includes('suspended') || lower.includes('banned')) {
      return isAr ? 'تم تعليق حسابك. يرجى الاتصال بالدعم.' : 'Your account has been suspended. Please contact support.';
    }
    if (lower.includes('not found') || lower.includes('deleted')) {
      return isAr ? 'الحساب غير موجود.' : 'Account not found.';
    }
    if (lower.includes('verify your email')) {
      return isAr ? 'يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.' : 'Please verify your email before logging in.';
    }
    return isAr ? 'فشل تسجيل الدخول.' : msg;
  }
}