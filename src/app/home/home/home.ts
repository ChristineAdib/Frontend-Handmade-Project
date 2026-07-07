import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
//import { FeaturesSectionComponent } from '../features-section/features-section';
import { CategoriesComponent } from '../categories/categories';
import { ValuesComponent } from '../values/values';
import { VideoComponent } from '../video/video';
import { FooterComponent } from '../footer/footer';
import { SubscribeComponent } from '../subscribe/subscribe';

import { BestsellersComponent } from '../bestsellers/bestsellers';
import { TopShopsComponent } from '../top-shops/top-shops';
import { ReviewsComponent } from '../reviews/reviews';
import { MobileApp } from '../mobile-app/mobile-app';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, CategoriesComponent, BestsellersComponent, ValuesComponent, VideoComponent,
    FooterComponent, SubscribeComponent, TopShopsComponent, ReviewsComponent, MobileApp],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent { }