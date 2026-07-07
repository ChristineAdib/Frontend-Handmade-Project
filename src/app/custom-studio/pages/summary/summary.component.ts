import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestDetailDto, GeneratedDesignDto, CustomConfiguration, mapNestedToFlat } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  selectedDesign = signal<GeneratedDesignDto | null>(null);
  parsedConfig = signal<CustomConfiguration | null>(null);
  loading = signal<boolean>(true);

  // Computed summary values
  outfitColorsList = computed(() => this.parsedConfig()?.outfitColors || []);
  accessoriesList = computed(() => this.parsedConfig()?.accessories || []);

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadSummaryDetails(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadSummaryDetails(id: string): void {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          
          // Get the selected design details
          if (res.data.selectedDesignId && res.data.generatedDesigns) {
            const chosen = res.data.generatedDesigns.find(d => d.id === res.data.selectedDesignId);
            if (chosen) {
              this.selectedDesign.set(chosen);
            }
          } else if (res.data.generatedDesigns && res.data.generatedDesigns.length > 0) {
            // Fallback to first if none marked selected
            const chosen = res.data.generatedDesigns.find(d => d.isSelected) || res.data.generatedDesigns[0];
            this.selectedDesign.set(chosen);
          }

          // Parse saved configuration JSON
          if (res.data.customConfiguration?.configurationDataJson) {
            try {
              let configObj = JSON.parse(res.data.customConfiguration.configurationDataJson);
              if (configObj.Hair || configObj.Gender !== undefined || configObj.Outfit !== undefined) {
                configObj = mapNestedToFlat(configObj);
              }
              this.parsedConfig.set(configObj);
            } catch (e) {
              console.error('Failed to parse config json in summary:', e);
            }
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load design summary');
        console.error(err);
      }
    });
  }

  proceedToMatching(): void {
    this.router.navigate(['/custom-studio/matching', this.requestId()]);
  }

  selectDesign(design: GeneratedDesignDto): void {
    this.selectedDesign.set(design);
    this.customStudioService.selectGeneratedDesign(this.requestId(), design.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
        }
      }
    });
  }

  saveDesignDetails(design: GeneratedDesignDto): void {
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
          const updatedDetails = this.requestDetails();
          if (updatedDetails && updatedDetails.generatedDesigns) {
            updatedDetails.generatedDesigns.forEach(d => {
              if (d.id === design.id) {
                d.isSaved = newSaveStatus;
              }
            });
            this.requestDetails.set({ ...updatedDetails });
            const currentSelected = this.selectedDesign();
            if (currentSelected && currentSelected.id === design.id) {
              currentSelected.isSaved = newSaveStatus;
              this.selectedDesign.set({ ...currentSelected });
            }
          }
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

  getDifficulty(): string {
    const config = this.parsedConfig();
    if (!config) return 'Intermediate';
    const accCount = config.accessories?.length || 0;
    if (accCount > 1) return 'Advanced';
    if (config.bodyType?.toLowerCase() === 'chibi') return 'Beginner';
    return 'Intermediate';
  }

  getCraftTime(): string {
    const diff = this.getDifficulty();
    if (diff === 'Beginner') return '4 - 6 hours';
    if (diff === 'Advanced') return '12 - 16 hours';
    return '8 - 10 hours';
  }

  getPriceRange(): string {
    const budget = this.requestDetails()?.targetBudget;
    if (budget) {
      return `EGP ${Math.round(budget * 0.8)} - EGP ${Math.round(budget * 1.2)}`;
    }
    const diff = this.getDifficulty();
    if (diff === 'Beginner') return 'EGP 250 - EGP 350';
    if (diff === 'Advanced') return 'EGP 500 - EGP 700';
    return 'EGP 350 - EGP 500';
  }

  getDeliveryTime(): string {
    const diff = this.getDifficulty();
    if (diff === 'Beginner') return '3 - 5 Days';
    if (diff === 'Advanced') return '7 - 10 Days';
    return '4 - 6 Days';
  }

  getWhyYouLoveIt(): string {
    const config = this.parsedConfig();
    if (!config) {
      return "This charming crochet doll combines soft pastel colors with delicate handcrafted details, making it perfect as a personalized keepsake or thoughtful gift.";
    }
    const parts: string[] = [];
    if (config.gender) {
      parts.push(`adorable ${config.gender.toLowerCase()} doll archetype`);
    } else {
      parts.push("charming crochet doll");
    }
    if (config.hairStyle && config.hairStyle !== 'Bald') {
      parts.push(`delicately styled ${config.hairStyle.toLowerCase()} hair`);
    }
    if (config.outfitStyle) {
      parts.push(`a custom ${config.outfitStyle.toLowerCase()}`);
    }
    
    const features = parts.join(' and ');
    return `This ${features || 'charming crochet doll'} combines soft pastel colors with delicate handcrafted details, making it perfect as a personalized keepsake or thoughtful gift for your loved ones.`;
  }

  getPrimaryColors(): string[] {
    const colors: string[] = [];
    const config = this.parsedConfig();
    if (config) {
      if (config.hairColor) {
        const c = this.colorNameToHex(config.hairColor);
        if (c) colors.push(c);
      }
      if (config.skinTone) {
        const c = this.colorNameToHex(config.skinTone);
        if (c) colors.push(c);
      }
      if (config.outfitColors && config.outfitColors.length > 0) {
        config.outfitColors.forEach(col => {
          const c = this.colorNameToHex(col);
          if (c && !colors.includes(c)) colors.push(c);
        });
      }
    }
    const presets = ['#e8a7a1', '#e2c293', '#b37e4e', '#8c5827', '#fdfbf7'];
    for (const p of presets) {
      if (colors.length < 5 && !colors.includes(p)) {
        colors.push(p);
      }
    }
    return colors;
  }

  colorNameToHex(color: string): string | null {
    if (!color) return null;
    if (color.startsWith('#')) return color;
    const clean = color.toLowerCase().trim();
    const map: { [key: string]: string } = {
      'brown': '#8b5a2b',
      'dark brown': '#5c3a21',
      'blonde': '#faf0be',
      'yellow': '#f39c12',
      'black': '#1a1a1a',
      'red': '#c0392b',
      'blue': '#2980b9',
      'green': '#27ae60',
      'pink': '#e8a7a1',
      'white': '#f5f5f5',
      'fair': '#fbe5d6',
      'tan': '#d2b48c',
      'peach': '#ffdab9',
      'ivory': '#fffff0',
      'espresso': '#3e2723',
      'bronze': '#cd7f32',
      'gold': '#ffd700',
      'grey': '#7f8c8d',
      'gray': '#7f8c8d',
      'purple': '#8e44ad',
      'orange': '#d35400'
    };
    return map[clean] || null;
  }
}
