import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  isAnimating = signal(false);
  imageError = signal(false);
  private autoPlayInterval: any;

  slides = [
    {
      tag: 'HANDMADE WITH PASSION',
      title: 'Where Every Piece',
      titleLine2: 'Tells a Story',
      subtitle: 'Every piece carries the touch of skilled hands and a unique story. Discover handmade treasures crafted by Egyptian artisans with passion and love.',
      btnText: 'EXPLORE HANDAURA',
      btnRoute: '/products',
      watermark: 'HANDAURA',
      image: 'https://plus.unsplash.com/premium_photo-1679868096292-54efdc6c021f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      accent: '#c8813a',
    },
    {
      tag: 'YOUR VISION, THEIR CRAFT',
      title: 'Have Something',
      titleLine2: 'Special in Mind?',
      subtitle: 'Share your dream with our artisans and watch it come to life. From personalized engravings to bespoke designs, every custom piece is crafted with passion and precision.',
      btnText: 'REQUEST CUSTOM PIECE',
      btnRoute: '/custom-order',
      watermark: 'CUSTOM',
      image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
      accent: '#8B5E3C',
    },
    {
      tag: 'GIFTS WITH SOUL',
      title: 'Find the Perfect Gift',
      titleLine2: 'For Every Moment',
      subtitle: 'Whether it\'s a birthday, anniversary, or just because — discover handmade treasures matched to your occasion and your loved one\'s unique spirit.',
      btnText: 'DISCOVER GIFTS',
      btnRoute: '/gifts',
      watermark: 'GIFTS',
      image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80',
      accent: '#E8913A',
    }
  ];

  ngOnInit() { this.startAutoPlay(); }
  ngOnDestroy() { this.stopAutoPlay(); }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.goToSlide((this.currentSlide() + 1) % this.slides.length);
    }, 6000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }

  goToSlide(index: number) {
    if (this.isAnimating() || index === this.currentSlide()) return;
    this.isAnimating.set(true);
    
    setTimeout(() => {
      this.currentSlide.set(index);
      this.imageError.set(false);
    }, 300);
    
    setTimeout(() => {
      this.isAnimating.set(false);
    }, 900);
    
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onImageError(event: Event) {
    this.imageError.set(true);
    console.log('Image failed to load:', this.slide.image);
  }

  get slide() { return this.slides[this.currentSlide()]; }
}