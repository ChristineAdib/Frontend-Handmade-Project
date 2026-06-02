import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';
type AuthTab = 'login' | 'register' | 'otp';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  private fb       = inject(FormBuilder);
  private auth     = inject(AuthService);
  private router   = inject(Router);

  activeTab   = signal<AuthTab>('login');
  isLoading   = signal(false);
  errorMsg    = signal<string | null>(null);
  otpEmail    = signal<string>('');
  showPass    = signal(false);
  showConfirm = signal(false);
  otpTimer    = signal(60);
  canResend   = signal(false);
  private timerInterval: any;

  // ── Forms ──────────────────────────────────────────────────
  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    name:            ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber:     [''],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role:            ['Buyer', Validators.required]
  }, { validators: this.passwordMatchValidator });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  // ── Helpers ────────────────────────────────────────────────
  switchTab(tab: AuthTab) {
    this.activeTab.set(tab);
    this.errorMsg.set(null);
  }

  selectRole(role: 'Buyer' | 'Seller') {
    this.registerForm.patchValue({ role });
  }

  togglePass()    { this.showPass.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass    = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // ── Login ──────────────────────────────────────────────────
  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.auth.login(this.loginForm.value as any).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) this.router.navigate(['/']);
        else this.errorMsg.set(res.errors?.[0] ?? 'Login failed.');
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.errors?.[0] ?? 'Login failed.');
      }
    });
  }

  // ── Register ───────────────────────────────────────────────
  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set(null);

    const v = this.registerForm.value;
    this.auth.register(v as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.otpEmail.set(v.email!);
        this.switchTab('otp');
        this.startOtpTimer();
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.errors?.[0] ?? 'Registration failed.');
      }
    });
  }

  // ── OTP ────────────────────────────────────────────────────
  onVerifyOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.auth.verifyOtp({
      email: this.otpEmail(),
      OtpCode:   this.otpForm.value.otp
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.errors?.[0] ?? 'Invalid OTP.');
      }
    });
  }

  onResendOtp() {
    if (!this.canResend()) return;
    this.auth.resendOtp({ email: this.otpEmail() }).subscribe({
      next: () => {
        this.otpTimer.set(60);
        this.canResend.set(false);
        this.startOtpTimer();
      }
    });
  }

  private startOtpTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.otpTimer.update(v => {
        if (v <= 1) {
          clearInterval(this.timerInterval);
          this.canResend.set(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }
}