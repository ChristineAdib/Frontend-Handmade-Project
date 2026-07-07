import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService, translations } from '../../../core/services/language.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements AfterViewInit {
  protected readonly langService = inject(LanguageService);
  private readonly el = inject(ElementRef);

  displayStats: { target: number; current: number; suffix: string; labelKey: keyof typeof translations.en }[] = [
    { target: 150, current: 0, suffix: '+', labelKey: 'statArtisans' },
    { target: 5000, current: 0, suffix: '+', labelKey: 'statProducts' },
    { target: 10, current: 0, suffix: 'K+', labelKey: 'statCustomers' },
    { target: 98, current: 0, suffix: '%', labelKey: 'statReviews' }
  ];

  private animated = false;

  ngAfterViewInit() {
    // Setup observer for counter animation
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animateCounters();
          this.animated = true;
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const statsSec = this.el.nativeElement.querySelector('.stats-section');
    if (statsSec) {
      statsObserver.observe(statsSec);
    }

    // Setup observer for fade-up reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    const revealElements = this.el.nativeElement.querySelectorAll('.reveal');
    revealElements.forEach((element: HTMLElement) => {
      revealObserver.observe(element);
    });
  }

  animateCounters() {
    const duration = 1500; // 1.5 seconds animation duration
    const steps = 50;
    const stepTime = duration / steps;

    this.displayStats.forEach(stat => {
      let stepCount = 0;
      const increment = stat.target / steps;
      const interval = setInterval(() => {
        stepCount++;
        stat.current = Math.min(stat.target, Math.round(increment * stepCount));
        if (stepCount >= steps) {
          stat.current = stat.target;
          clearInterval(interval);
        }
      }, stepTime);
    });
  }
}
