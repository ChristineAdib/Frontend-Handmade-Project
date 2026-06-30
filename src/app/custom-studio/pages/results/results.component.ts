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

  // Refinement details
  refinementPrompts = signal<{[key: string]: string}>({});
  refining = signal<string | null>(null);

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

  goBack(): void {
    const details = this.requestDetails();
    const isPhoto = (details?.selectedDesign?.prompt?.includes('inspired by the uploaded person')) || !!details?.referenceImageUrl;
    if (isPhoto) {
      this.router.navigate(['/custom-studio/photo']);
    } else {
      this.router.navigate(['/custom-studio/customize', this.requestId()]);
    }
  }

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

  updateRefinementPrompt(designId: string, val: string): void {
    this.refinementPrompts.update(prev => ({ ...prev, [designId]: val }));
  }

  applyRefinementPrompt(designId: string, val: string): void {
    this.updateRefinementPrompt(designId, val);
  }

  refineDesign(designId: string): void {
    const prompt = this.refinementPrompts()[designId];
    if (!prompt || !prompt.trim()) {
      this.toastr.warning('Please enter a refinement instruction.');
      return;
    }

    const details = this.requestDetails();
    if (details && details.generationCount >= 2) {
      this.toastr.warning('You have used all available AI generation attempts.');
      return;
    }

    this.refining.set(designId);
    this.toastr.info('AI is refining your design details...');

    this.customStudioService.refineAiImage(this.requestId(), designId, prompt.trim()).subscribe({
      next: (res) => {
        this.refining.set(null);
        if (res.success && res.data) {
          this.toastr.success('Design refined successfully!');
          this.requestDetails.set(res.data);
          this.designs.set(res.data.generatedDesigns || []);
          // Clear prompt
          this.updateRefinementPrompt(designId, '');
          // Navigate to summary with selected refined design
          this.router.navigate(['/custom-studio/summary', this.requestId()]);
        } else {
          this.toastr.error('Failed to refine design');
        }
      },
      error: (err) => {
        this.refining.set(null);
        this.toastr.error('An error occurred during refinement.');
        console.error(err);
      }
    });
  }

  getDesignScores(matchingScore: number) {
    const seed = Math.round(matchingScore);
    const creativity = Math.min(99, Math.round(matchingScore + (seed % 5)));
    const difficulty = Math.min(95, Math.round(matchingScore - (seed % 7)));
    const cost = (seed % 2 === 0) ? 'Low' : 'Medium';
    const popularity = (seed % 3 === 0) ? 'High' : 'Trending';
    return {
      creativity,
      difficulty,
      cost,
      popularity,
      overall: Math.round((creativity + difficulty) / 2)
    };
  }

  getSmartSuggestions(prompt: string): string[] {
    const suggestions: string[] = [];
    const p = prompt.toLowerCase();
    if (p.includes('blue')) {
      suggestions.push('Consider white sneakers to complement the blue jacket.');
    } else {
      suggestions.push('A pastel pink bag would look great with this outfit.');
    }
    if (p.includes('hat')) {
      suggestions.push('Adding longer, wavy hair under the hat creates a nice drape.');
    } else {
      suggestions.push('Try adding a tiny matching bow accessory to the hair.');
    }
    suggestions.push('Using a slightly thicker yarn gauge would make the stitches look extra defined.');
    return suggestions.slice(0, 2);
  }

  trackByDesignId(index: number, design: GeneratedDesignDto): string {
    return design.id;
  }
}
