// subscribe.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe.html',
  styleUrls: ['./subscribe.css']
})
export class SubscribeComponent {
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