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
  imagePreview = signal<string | null>(null);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  private passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  };

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    ]], confirmPassword: ['', Validators.required],
    role: ['Buyer', Validators.required],
    bio: [''],
    profileImage: [null as File | null]
  }, { validators: this.passwordMatchValidator });

  togglePass() { this.showPass.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }



  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.registerForm.patchValue({ profileImage: file });
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onRemoveImage() {
    this.registerForm.patchValue({ profileImage: null });
    this.imagePreview.set(null);
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.auth.errorMsg.set(null);
    this.emailError.set(null);      // ضيفي دي
    this.passwordError.set(null);
    const v = this.registerForm.value;
    this.auth.register(v as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.auth.otpEmail.set(v.email!);
        this.auth.activeTab.set('otp');
      },
      error: err => {
        this.isLoading.set(false);
const msg: string = err.error?.message ?? err.error?.errors?.[0] ?? 'Registration failed.';console.log('full err.error:', JSON.stringify(err.error));

        if (msg.includes('already exists')) {
          this.emailError.set(this.langService.currentLang() === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل.' : 'This email is already registered.');
        } else if (msg.includes('password') || msg.includes('Password')) {
          this.passwordError.set(msg);
        } else {
          this.auth.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل التسجيل.' : 'Registration failed.');
        }
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