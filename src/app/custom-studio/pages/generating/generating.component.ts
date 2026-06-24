import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-generating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generating.component.html',
  styleUrl: './generating.component.css'
})
export class GeneratingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  
  // Custom Thinking texts cycling
  thinkingMessages = [
    'Understanding your design settings...',
    'Consulting creative doll blueprints...',
    'Orchestrating yarn color harmony...',
    'Structuring crochet stitch patterns...',
    'Generating micro-knit details...',
    'Rendering handmade textures...',
    'Almost ready...'
  ];
  currentMessageIndex = signal<number>(0);
  progressValue = signal<number>(0);
  
  private messageInterval: any;
  private progressInterval: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.startTimers();
      this.triggerGeneration(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  startTimers(): void {
    // Cycle messages every 2.5 seconds
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex.update(idx => (idx + 1) % this.thinkingMessages.length);
    }, 2500);

    // Simulate progress bar (up to 95%)
    this.progressInterval = setInterval(() => {
      this.progressValue.update(val => {
        if (val < 95) {
          return val + Math.floor(Math.random() * 5) + 1;
        }
        return val;
      });
    }, 600);
  }

  clearTimers(): void {
    if (this.messageInterval) clearInterval(this.messageInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  triggerGeneration(id: string): void {
    this.customStudioService.generateAiImages(id).subscribe({
      next: (res) => {
        this.clearTimers();
        this.progressValue.set(100);
        if (res.success) {
          this.toastr.success('AI Designs generated successfully!');
          setTimeout(() => {
            this.router.navigate(['/custom-studio/results', id]);
          }, 800);
        } else {
          this.toastr.error('Generation failed: ' + (res.message || 'Unknown error'));
          this.router.navigate(['/custom-studio/wizard', id]);
        }
      },
      error: (err) => {
        this.clearTimers();
        console.error(err);
        this.toastr.error('AI Generation encountered an error. Redirecting back to wizard.');
        this.router.navigate(['/custom-studio/wizard', id]);
      }
    });
  }
}
