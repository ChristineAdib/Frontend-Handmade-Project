import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../Services/auth';
import { LanguageService } from '../../../../../core/services/language.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})
export class OtpComponent implements OnDestroy {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  auth           = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  otpTimer  = signal(60);
  canResend = signal(false);
  private timerInterval: any;

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  constructor() { this.startOtpTimer(); }

  ngOnDestroy() { clearInterval(this.timerInterval); }

  onVerifyOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);

    this.auth.verifyOtp({
      email:   this.auth.otpEmail(),
      OtpCode: this.otpForm.value.otp
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.isLoading.set(false);
        this.auth.errorMsg.set(err.error?.errors?.[0] ?? 'Invalid OTP.');
      }
    });
  }

  onResendOtp() {
    if (!this.canResend()) return;
    this.auth.resendOtp({ email: this.auth.otpEmail() }).subscribe({
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