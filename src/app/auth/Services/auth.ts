import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthResponse } from '../models/auth-response.mode';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

type AuthTab = 'login' | 'register' | 'otp';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  // ── Shared UI state ────────────────────────────────────────
  activeTab  = signal<AuthTab>('login');
  otpEmail   = signal<string>('');
  errorMsg   = signal<string | null>(null);
  private logoutTimer: any;

  login(model: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`,
      model
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
          this.startTokenTimer(res.data.tokenExpiry);
        }
      })
    );
  }

  loginWithGoogle(credential: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/google`,
      { credential }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
          this.startTokenTimer(res.data.tokenExpiry);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, model);
  }

  register(model: RegisterRequest) {

    const formData = new FormData();

    formData.append('name', model.name);
    formData.append('email', model.email);
    formData.append('password', model.password);
    formData.append('confirmPassword', model.confirmPassword);
    formData.append('role', model.role);

    if (model.phoneNumber)
      formData.append('phoneNumber', model.phoneNumber);

    if (model.bio)
      formData.append('bio', model.bio);

    if (model.profileImage)
      formData.append('profileImage', model.profileImage);

    return this.http.post(
      `${this.apiUrl}/register`,
      formData
    );
  }

  verifyOtp(model: any) {
    return this.http.post(
      `${this.apiUrl}/verify-otp`,
      model
    );
  }

  resendOtp(model: any) {
    return this.http.post(
      `${this.apiUrl}/resend-otp`,
      model
    );
  }

  private setSession(auth: AuthResponse) {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth));
    localStorage.setItem('expiry', auth.tokenExpiry);
  }

  updateSession(auth: AuthResponse) {
    this.setSession(auth);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  restoreSession() {
    const expiry = localStorage.getItem('expiry');

    if (expiry) {
      this.startTokenTimer(expiry);
    }
  }

  private startTokenTimer(expiry: string) {

    const expiryTime = new Date(expiry).getTime();
    const now = new Date().getTime();

    const timeout = expiryTime - now;

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    if (timeout <= 0) {
      this.logout();
      return;
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
      alert('Session expired. Please login again.');
    }, timeout);
  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    window.location.href = '/login';
  }
}