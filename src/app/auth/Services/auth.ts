import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Pipe } from '@angular/core';
import { IloginRequest } from '../models/ilogin-request';
import { Observable, tap } from 'rxjs';
import { ILoginResponse } from '../models/ilogin-response';
import { API_URLS } from '../../constants/API_URLS';
import { LoginWithApi } from '../components/login-with-api/login-with-api';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);


  login(data: IloginRequest): Observable<ILoginResponse>{
    return this.http.post<ILoginResponse>(API_URLS.login, data).pipe(
      tap((response) => {
        this.saveToken(response.access_token);
      })
    ); 
  }


  saveToken(tokenValue: string): void {
    localStorage.setItem('this.tokenKey', tokenValue);
  }

  getToken(): string | null {
    return localStorage.getItem('this.tokenKey');
  }

  //deleteToken == logout
  logout(): void {
    localStorage.removeItem('this.tokenKey');
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }


}
// function tag(arg0: () => void): import("rxjs").OperatorFunction<ILoginResponse, ILoginResponse> {
//   throw new Error('Function not implemented.');
// }




//لاحظ عاوزين نعمل زرار نربط بيه الكلام دا فى ال header  