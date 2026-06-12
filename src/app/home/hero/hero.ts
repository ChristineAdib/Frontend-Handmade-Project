import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
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
        tag: this.langService.translate('heroBeadsTag'),
        title: this.langService.translate('heroBeadsTitle'),
        titleLine2: this.langService.translate('heroBeadsTitleL2'),
        subtitle: this.langService.translate('heroBeadsSubtitle'),
        btnText: this.langService.translate('heroBeadsBtn'),
        btnRoute: '/products',
        watermark: this.langService.translate('heroBeadsWatermark'),
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        accent: '#c8813a',
      },
      {
        tag: this.langService.translate('heroPotteryTag'),
        title: this.langService.translate('heroPotteryTitle'),
        titleLine2: this.langService.translate('heroPotteryTitleL2'),
        subtitle: this.langService.translate('heroPotterySubtitle'),
        btnText: this.langService.translate('heroPotteryBtn'),
        btnRoute: '/products',
        watermark: this.langService.translate('heroPotteryWatermark'),
        image:  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
        accent: '#8B5E3C',
      },
      {
        tag: this.langService.translate('heroCrochetTag'),
        title: this.langService.translate('heroCrochetTitle'),
        titleLine2: this.langService.translate('heroCrochetTitleL2'),
        subtitle: this.langService.translate('heroCrochetSubtitle'),
        btnText: this.langService.translate('heroCrochetBtn'),
        btnRoute: '/products',
        watermark: this.langService.translate('heroCrochetWatermark'),
        image: 'https://plus.unsplash.com/premium_vector-1742086284763-42ac1d261be0?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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