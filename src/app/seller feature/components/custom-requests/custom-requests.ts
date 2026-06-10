import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-custom-requests',
  standalone: true,
  imports: [],
  templateUrl: './custom-requests.html',
  styleUrl: './custom-requests.css',
})
export class CustomRequests {
  protected readonly langService = inject(LanguageService);
}
