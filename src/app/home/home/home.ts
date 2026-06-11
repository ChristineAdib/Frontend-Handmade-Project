import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
//import { FeaturesSectionComponent } from '../features-section/features-section';
import { CategoriesComponent } from '../categories/categories';
import { ValuesComponent } from '../values/values';
import { VideoComponent } from '../video/video';

import { BestsellersComponent } from '../bestsellers/bestsellers'; 
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, CategoriesComponent, BestsellersComponent, ValuesComponent, VideoComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {}