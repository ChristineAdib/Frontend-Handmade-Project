import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clock } from '../../../shared/clock/clock';
import { FormsModule } from '@angular/forms';
import { Products } from '../../../products feature/components/products/products';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Clock, FormsModule, Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  showClock: boolean = true;

  //هيتبعت لل child
  searchTerm: string = '';
}
