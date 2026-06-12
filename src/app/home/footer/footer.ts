import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  protected readonly langService = inject(LanguageService);
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}