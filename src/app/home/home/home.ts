import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
//import { FeaturesSectionComponent } from '../features-section/features-section';
import { CategoriesComponent } from '../categories/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, CategoriesComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {}