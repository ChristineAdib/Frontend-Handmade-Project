import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GiftAssistantApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.domain}/api/gift-assistant`;

  chat(sessionId: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/chat`, { sessionId, message },
      {withCredentials:  true});
  }

  resetSession(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset`, { sessionId },
      {withCredentials:  true});
  }
}
