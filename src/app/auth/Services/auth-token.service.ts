import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private readonly _token = signal<string | null>(null);

  get token() {
    return this._token.asReadonly();
  }

  setToken(token: string | null) {
    this._token.set(token);
  }
}
