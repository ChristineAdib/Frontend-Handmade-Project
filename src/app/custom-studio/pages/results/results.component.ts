import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestDetailDto, GeneratedDesignDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  designs = signal<GeneratedDesignDto[]>([]);
  loading = signal<boolean>(true);
  regenerating = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadResults(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadResults(id: string): void {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.designs.set(res.data.generatedDesigns || []);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load design results');
        console.error(err);
      }
    });
  }

  selectDesign(designId: string): void {
    this.customStudioService.selectGeneratedDesign(this.requestId(), designId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Design selected successfully!');
          this.router.navigate(['/custom-studio/summary', this.requestId()]);
        } else {
          this.toastr.error('Failed to select design');
        }
      },
      error: (err) => {
        this.toastr.error('An error occurred during selection.');
        console.error(err);
      }
    });
  }

  saveDesignDetails(design: GeneratedDesignDto): void {
    // Toggles the save status
    const newSaveStatus = !design.isSaved;
    this.customStudioService.saveDesign(this.requestId(), design.id, {
      requestId: this.requestId(),
      imageUrl: design.imageUrl,
      prompt: design.prompt,
      provider: design.provider,
      generationTimeMs: design.generationTimeMs,
      matchingScore: design.matchingScore,
      patternStepsMarkdown: design.patternStepsMarkdown,
      isSaved: newSaveStatus
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(newSaveStatus ? 'Design saved to history!' : 'Design removed from saved list.');
          this.loadResults(this.requestId());
        }
      }
    });
  }

  downloadImage(url: string, designId: string): void {
    this.toastr.info('Preparing design download...');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `custom-doll-design-${designId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  regenerateDesigns(): void {
    const details = this.requestDetails();
    if (!details) return;

    if (details.generationCount >= 2) {
      this.toastr.warning('You have used all available AI generation attempts.');
      return;
    }

    if (confirm('Regenerating will consume one of your remaining attempts. Do you want to proceed?')) {
      this.router.navigate(['/custom-studio/generating', this.requestId()]);
    }
  }

  trackByDesignId(index: number, design: GeneratedDesignDto): string {
    return design.id;
  }
}
