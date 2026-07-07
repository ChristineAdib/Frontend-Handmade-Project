import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-commission-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commission-banner.component.html',
  styleUrl: './commission-banner.component.css'
})
export class CommissionBannerComponent {
  protected readonly langService = inject(LanguageService);
}
