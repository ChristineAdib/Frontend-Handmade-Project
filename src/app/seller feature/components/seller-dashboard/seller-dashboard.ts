import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../auth/Services/auth';
import { SellerAnalyticsService } from '../../services/seller-analytics.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css'
})
export class SellerDashboard implements OnInit {
  protected readonly langService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly analyticsService = inject(SellerAnalyticsService);

  userName = signal<string>('Sarah Ahmed');
  shopLogo = signal<string | null>(null);
  showDropdown = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName.set(user.name);
    }
    this.analyticsService.getSummary('last30days').subscribe({
      next: res => {
        if (res) {
          if (res.sellerName || res.SellerName) this.userName.set(res.sellerName || res.SellerName);
          if (res.shopLogo || res.ShopLogo) this.shopLogo.set(res.shopLogo || res.ShopLogo);
        }
      },
      error: err => console.error(err)
    });
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
