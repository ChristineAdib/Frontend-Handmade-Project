import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  protected readonly langService = inject(LanguageService);

  currentSlide = signal(0);
  isAnimating = signal(false);
  imageError = signal(false);
  private autoPlayInterval: any;

  get slides() {
    return [
      {
        tag: this.langService.translate('heroPassionTag'),
        title: this.langService.translate('heroPassionTitle'),
        titleLine2: this.langService.translate('heroPassionTitleL2'),
        subtitle: this.langService.translate('heroPassionSubtitle'),
        btnText: this.langService.translate('heroPassionBtn'),
        btnRoute: '/products',
        watermark: this.langService.translate('heroPassionWatermark'),
        image: 'https://plus.unsplash.com/premium_photo-1679868096292-54efdc6c021f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        accent: '#c8813a',
      },
      {
        tag: this.langService.translate('heroCustomTag'),
        title: this.langService.translate('heroCustomTitle'),
        titleLine2: this.langService.translate('heroCustomTitleL2'),
        subtitle: this.langService.translate('heroCustomSubtitle'),
        btnText: this.langService.translate('heroCustomBtn'),
        btnRoute: '/custom-order',
        watermark: this.langService.translate('heroCustomWatermark'),
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
        accent: '#8B5E3C',
      },
      {
        tag: this.langService.translate('heroGiftsTag'),
        title: this.langService.translate('heroGiftsTitle'),
        titleLine2: this.langService.translate('heroGiftsTitleL2'),
        subtitle: this.langService.translate('heroGiftsSubtitle'),
        btnText: this.langService.translate('heroGiftsBtn'),
        btnRoute: '/gifts',
        watermark: this.langService.translate('heroGiftsWatermark'),
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80',
        accent: '#E8913A',
      }
    ];
  }

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