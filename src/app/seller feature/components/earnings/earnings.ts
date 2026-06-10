import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [],
  templateUrl: './earnings.html',
  styleUrl: './earnings.css',
})
export class Earnings {
  protected readonly langService = inject(LanguageService);
}
