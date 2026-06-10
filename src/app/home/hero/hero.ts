import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  isAnimating = signal(false);
  imageError = signal(false);
  private autoPlayInterval: any;

  slides = [
    {
      tag: 'HANDMADE BEADS',
      title: 'Wear Your',
      titleLine2: 'Story',
      subtitle: 'Every bead carries a soul. Discover handcrafted jewelry made with passion by Egyptian artisans.',
      btnText: 'Explore Beads',
      btnRoute: '/products',
      watermark: 'BEADS',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      accent: '#c8813a',
    },
    {
      tag: 'HANDMADE POTTERY',
      title: 'Shaped by',
      titleLine2: 'Ancient Hands',
      subtitle: 'Clay transformed into art. Each piece tells the story of Egypt\'s timeless heritage.',
      btnText: 'Explore Pottery',
      btnRoute: '/products',
      watermark: 'POTTERY',
      image:  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
      accent: '#8B5E3C',
    },
    {
      tag: 'HANDMADE CROCHET',
      title: 'Crafted with',
      titleLine2: 'Love & Thread',
      subtitle: 'One stitch at a time. Unique crochet pieces woven with creativity and warmth.',
      btnText: 'Explore Crochet',
      btnRoute: '/products',
      watermark: 'CROCHET',
      image: 'https://plus.unsplash.com/premium_vector-1742086284763-42ac1d261be0?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      accent: '#E8913A', // برتقاني دافي
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