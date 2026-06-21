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
        image: 'images/pottery.png',
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
        image: '/images/custom.png',
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
        image: '/images/gift.png',
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
    }, 250);
    setTimeout(() => {
      this.isAnimating.set(false);
    }, 750);
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onImageError(event: Event) {
    this.imageError.set(true);
  }

  get slide() { return this.slides[this.currentSlide()]; }
}