import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.html',
  styleUrls: ['./video.css']
})
export class VideoComponent {
  protected readonly langService = inject(LanguageService);
  isPlaying: boolean = false;
  safeVideoUrl: SafeResourceUrl | null = null;

  private videoUrl: string = '';
  // ← هنا تحطي لينك اليوتيوب بالشكل ده:
  // https://www.youtube.com/embed/XXXXXXXXX

  constructor(private sanitizer: DomSanitizer) {
    if (this.videoUrl) {
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    }
  }

  openVideo() {
    this.isPlaying = true;
    document.body.style.overflow = 'hidden';
  }

  closeVideo() {
    this.isPlaying = false;
    document.body.style.overflow = 'auto';
  }
}