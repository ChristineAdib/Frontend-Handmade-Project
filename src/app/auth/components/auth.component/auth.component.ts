import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../Services/auth';
import { LoginComponent } from '../auth.component/loginComponent/login.component/login.component';
import { RegisterComponent } from '../registerComponent/register.component/register.component';
import { OtpComponent } from '../auth.component/otpComponent/otp.component/otp.component';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent, OtpComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  auth  = inject(AuthService);
  route = inject(ActivatedRoute);
  protected readonly langService = inject(LanguageService);

  constructor() {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'register') this.auth.activeTab.set('register');
    else                     this.auth.activeTab.set('login');
  }
}