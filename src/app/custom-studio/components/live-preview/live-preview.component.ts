import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomConfiguration } from '../../models/custom-studio.models';

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-preview.component.html',
  styleUrl: './live-preview.component.css'
})
export class LivePreviewComponent {
  config = input<CustomConfiguration | null>(null);

  // Fallback defaults
  gender = computed(() => this.config()?.gender || 'Girl');
  size = computed(() => this.config()?.size || '20 cm');
  bodyType = computed(() => this.config()?.bodyType || 'Normal');
  skinTone = computed(() => this.config()?.skinTone || '#ffe5d9');
  
  hairStyle = computed(() => this.config()?.hairStyle || 'Long');
  hairColor = computed(() => this.config()?.hairColor || '#5c3d2e');
  hairLength = computed(() => this.config()?.hairLength || 'Medium');
  hairTexture = computed(() => this.config()?.hairTexture || 'Straight');
  hairBangs = computed(() => this.config()?.hairBangs ?? true);

  eyeColor = computed(() => this.config()?.eyeColor || '#1e0e05');
  smileType = computed(() => this.config()?.smileType || 'Happy');
  eyebrowStyle = computed(() => this.config()?.eyebrowStyle || 'Normal');
  hasFreckles = computed(() => this.config()?.hasFreckles ?? false);
  hasBlush = computed(() => this.config()?.hasBlush ?? true);

  outfitCategory = computed(() => this.config()?.outfitCategory || 'Dress');
  outfitStyle = computed(() => this.config()?.outfitStyle || 'Casual');
  outfitColors = computed(() => this.config()?.outfitColors || ['#c8813a', '#fffdf9']);

  accessories = computed(() => this.config()?.accessories || []);

  personalizationName = computed(() => this.config()?.personalizationName || '');
  personalizationMessage = computed(() => this.config()?.personalizationMessage || '');
  personalizationFont = computed(() => this.config()?.personalizationFont || 'Arial');
  personalizationTextColor = computed(() => this.config()?.personalizationTextColor || '#1e0e05');

  // SVG Helper Properties
  hasAccessory(name: string): boolean {
    return this.accessories().includes(name);
  }

  getPrimaryOutfitColor(): string {
    return this.outfitColors()[0] || '#c8813a';
  }

  getSecondaryOutfitColor(): string {
    return this.outfitColors()[1] || '#fffdf9';
  }
}
