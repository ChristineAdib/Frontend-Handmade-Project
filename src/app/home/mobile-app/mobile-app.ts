import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-mobile-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-app.html',
  styleUrl: './mobile-app.css',
})
export class MobileApp implements OnInit {
  protected readonly langService = inject(LanguageService);
  isWebView = signal(false);

  ngOnInit() {
    console.log('MobileAppComponent is rendering!');
    if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if (ua.includes('HandAuraApp') || ua.includes('wv') || ua.includes('WebView')) {
        this.isWebView.set(true);
      }
    }
  }
}
