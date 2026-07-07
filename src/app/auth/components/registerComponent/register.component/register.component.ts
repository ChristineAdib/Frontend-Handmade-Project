import { Component, inject, signal, AfterViewInit } from '@angular/core';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth';
import { LanguageService } from '../../../../core/services/language.service';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  isLoading = signal(false);
  showPass = signal(false);
  showConfirm = signal(false);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  private passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  };

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    ]], confirmPassword: ['', Validators.required],
    role: ['Buyer', Validators.required],
    rememberMe: [false]
  }, { validators: this.passwordMatchValidator });

  togglePass() { this.showPass.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);
    this.emailError.set(null);
    this.passwordError.set(null);
    const v = this.registerForm.value;
    const remember = this.registerForm.value.rememberMe;
    const email = this.registerForm.value.email;

    this.auth.register(v as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        if (remember && email) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        this.auth.otpEmail.set(v.email!);
        this.auth.activeTab.set('otp');
      },
      error: err => {
        this.isLoading.set(false);
        const msg: string = this.auth.extractError(err, 'Registration failed.');

        if (msg.toLowerCase().includes('already exists')) {
          this.emailError.set(this.langService.currentLang() === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل.' : 'This email is already registered.');
        } else if (msg.toLowerCase().includes('password')) {
          this.passwordError.set(this.getLocalizedError(msg));
        } else {
          this.auth.errorMsg.set(this.getLocalizedError(msg));
        }
      }
    });
  }

  private getLocalizedError(msg: string): string {
    const isAr = this.langService.currentLang() === 'ar';
    const lower = msg.toLowerCase();

    if (lower.includes('already exists')) {
      return isAr ? 'هذا البريد الإلكتروني مسجل بالفعل.' : 'This email is already registered.';
    }
    if (lower.includes('failed to send otp email')) {
      return isAr ? 'فشل إرسال بريد التحقق (OTP). يرجى المحاولة مرة أخرى.' : 'Failed to send OTP email. Please try again.';
    }
    if (lower.includes('do not match') || lower.includes('mismatch')) {
      return isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.';
    }
    if (lower.includes('at least 8 characters') || lower.includes('minlength')) {
      return isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.';
    }
    return isAr ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : msg;
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

    console.log("Google Response:", response);
    console.log("Credential:", response.credential);

    this.isLoading.set(true);
    this.auth.errorMsg.set(null);

    this.auth.loginWithGoogle(response.credential).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.auth.errorMsg.set(this.auth.extractError(res, 'Google authentication failed.'));
        }
      },
      error: err => {
        this.isLoading.set(false);
        console.log(err);
        this.auth.errorMsg.set(this.auth.extractError(err, 'Google authentication failed.'));
      }
    });
  }
}