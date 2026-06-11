import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clock } from '../../../shared/clock/clock';
import { FormsModule } from '@angular/forms';
import { Products } from '../../../products feature/components/products/products';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Clock, FormsModule, Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  protected readonly langService = inject(LanguageService);
  showClock: boolean = true;

  //هيتبعت لل child
  searchTerm: string = '';
}
