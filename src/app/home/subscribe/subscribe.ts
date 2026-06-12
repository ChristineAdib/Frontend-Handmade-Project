import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe.html',
  styleUrls: ['./subscribe.css']
})
export class SubscribeComponent {
  protected readonly langService = inject(LanguageService);
  email: string = '';
  isSubmitted: boolean = false;
  isLoading: boolean = false;

  onSubscribe(): void {
    if (this.email && this.email.includes('@')) {
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.email = '';
        
        setTimeout(() => {
          this.isSubmitted = false;
        }, 4000);
      }, 1500);
    }
  }
}