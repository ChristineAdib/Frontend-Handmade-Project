import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, Subject, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthResponse } from '../models/auth-response.mode';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { API_URLS } from '../../constants/API_URLS';
import { AuthTokenService } from './auth-token.service';

type AuthTab = 'login' | 'register' | 'otp';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private authTokenService = inject(AuthTokenService);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  activeTab  = signal<AuthTab>('login');
  otpEmail   = signal<string>('');
  errorMsg   = signal<string | null>(null);
  readonly authChange$ = new Subject<void>();

  private logoutTimer: any;
  private banPollingSubscription: Subscription | null = null;
  private readonly POLL_INTERVAL_MS = 30_000;

  // In-memory session fallbacks for Tracking Prevention / private browsing
  private inMemoryToken: string | null = null;
  private inMemoryUser: AuthResponse | null = null;
  private inMemoryExpiry: string | null = null;

  constructor() {
    if (environment.authMode === 'bearer') {
      let hasToken = false;
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          this.authTokenService.setToken(savedToken);
          hasToken = true;
        }
      } catch (e) {
        console.warn('Failed to restore token from localStorage on startup:', e);
      }
      
      if (hasToken) {
        this.silentReauthenticate().subscribe();
      } else {
        this.restoreSession();
      }
    } else {
      this.restoreSession();
    }
  }

  // ── Login ──────────────────────────────────────────────────
  login(model: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`,
      model,
      {withCredentials:  true}
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
          this.startTokenTimer(res.data.tokenExpiry);
          this.startBanPolling();
        }
      })
    );
  }

  loginWithGoogle(credential: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/google`,
      {withCredentials:  true}
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
          this.startTokenTimer(res.data.tokenExpiry);
          this.startBanPolling();
        }
      })
    );
  }

  // ── Ban Polling ────────────────────────────────────────────
  startBanPolling(): void {
    this.stopBanPolling();

    this.banPollingSubscription = interval(this.POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.http.get<ApiResponse<any>>(API_URLS.checkBanStatus, {withCredentials:  true}).pipe(
          catchError(err => of(err))
        )
      )
    ).subscribe(res => {
      // 403 = banned (caught as error object from catchError)
      if (res?.status === 403 || res?.error?.success === false) {
        this.forceLogoutBanned();
      }
    });
  }

  stopBanPolling(): void {
    if (this.banPollingSubscription) {
      this.banPollingSubscription.unsubscribe();
      this.banPollingSubscription = null;
    }
  }

  forceLogoutBanned(): void {
    this.stopBanPolling();
    this.inMemoryToken = null;
    this.inMemoryUser = null;
    this.inMemoryExpiry = null;
    this.authTokenService.setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiry');
    } catch (e) {
      console.warn('Failed to clear localStorage for ban:', e);
    }

    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    this.authChange$.next();
    // Message to user before redirect
    try {
      localStorage.setItem('banned_msg', 'true');
    } catch {}
    window.location.href = '/login';
  }

  // ── Session ────────────────────────────────────────────────
  silentReauthenticate(): Observable<ApiResponse<AuthResponse>> {
    return this.http.get<ApiResponse<AuthResponse>>(
      API_URLS.checkBanStatus,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
          this.startTokenTimer(res.data.tokenExpiry);
          this.startBanPolling();
        }
      }),
      catchError(err => {
        console.warn('Silent re-authentication failed:', err);
        this.logoutQuietly();
        return of(err);
      })
    );
  }

  logoutQuietly() {
    this.stopBanPolling();
    this.inMemoryToken = null;
    this.inMemoryUser = null;
    this.inMemoryExpiry = null;
    this.authTokenService.setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiry');
    } catch (e) {
      console.warn('Failed to clear localStorage on quiet logout:', e);
    }

    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.authChange$.next();
  }

  restoreSession() {
    let expiry = this.inMemoryExpiry;
    try {
      expiry = localStorage.getItem('expiry') ?? this.inMemoryExpiry;
    } catch (e) {
      console.warn('Failed to restore expiry from localStorage:', e);
    }
    if (expiry) {
      this.startTokenTimer(expiry);
    }
    // If logged in → start polling
    if (this.isLoggedIn()) {
      this.startBanPolling();
    }
    this.authChange$.next();
  }

  private setSession(auth: AuthResponse) {
    this.inMemoryToken = auth.token;
    this.inMemoryUser = auth;
    this.inMemoryExpiry = auth.tokenExpiry;
    this.authTokenService.setToken(auth.token);
    try {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth));
      localStorage.setItem('expiry', auth.tokenExpiry);
    } catch (e) {
      console.warn('Failed to set session in localStorage:', e);
    }
    this.authChange$.next();
  }

  updateSession(auth: AuthResponse) {
    this.setSession(auth);
  }

  getToken(): string | null {
    if (environment.authMode === 'bearer') {
      return this.authTokenService.token();
    }
    try {
      return localStorage.getItem('token') ?? this.inMemoryToken;
    } catch {
      return this.inMemoryToken;
    }
  }

  getUser(): AuthResponse | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : this.inMemoryUser;
    } catch {
      return this.inMemoryUser;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.stopBanPolling();
    this.inMemoryToken = null;
    this.inMemoryUser = null;
    this.inMemoryExpiry = null;
    this.authTokenService.setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiry');
    } catch (e) {
      console.warn('Failed to clear localStorage on logout:', e);
    }

    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    this.authChange$.next();
    window.location.href = '/login';
  }

  private startTokenTimer(expiry: string) {
    const expiryTime = new Date(expiry).getTime();
    const now = new Date().getTime();
    const timeout = expiryTime - now;

    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    if (timeout <= 0) {
      this.logout();
      return;
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
      alert('Session expired. Please login again.');
    }, timeout);
  }

  // ── Other endpoints ────────────────────────────────────────
  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, { email }, {withCredentials:  true});
  }

  resetPassword(model: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, model, {withCredentials:  true});
  }

  register(model: RegisterRequest) {
    const formData = new FormData();
    formData.append('name', model.name);
    formData.append('email', model.email);
    formData.append('password', model.password);
    formData.append('confirmPassword', model.confirmPassword);
    formData.append('role', model.role);
    if (model.phoneNumber) formData.append('phoneNumber', model.phoneNumber);
    if (model.bio) formData.append('bio', model.bio);
    if (model.profileImage) formData.append('profileImage', model.profileImage);
    return this.http.post(`${this.apiUrl}/register`, formData,
      {withCredentials:  true});
  }

  verifyOtp(model: any) {
    return this.http.post(`${this.apiUrl}/verify-otp`, model,
      {withCredentials:  true});
  }

  resendOtp(model: any) {
    return this.http.post(`${this.apiUrl}/resend-otp`, model, {withCredentials:  true});
  }

  extractError(err: any, fallback: string = 'An error occurred.'): string {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    const errorObj = err.error ?? err;
    if (typeof errorObj === 'string') return errorObj;
    if (errorObj && typeof errorObj === 'object') {
      if (errorObj.message) return errorObj.message;
      if (errorObj.errors) {
        if (Array.isArray(errorObj.errors)) return errorObj.errors[0] || fallback;
        if (typeof errorObj.errors === 'object') {
          const keys = Object.keys(errorObj.errors);
          if (keys.length > 0) {
            const firstVal = errorObj.errors[keys[0]];
            if (Array.isArray(firstVal)) return firstVal[0] || fallback;
            if (typeof firstVal === 'string') return firstVal;
          }
        }
      }
    }
    return fallback;
  }
}