import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { LivePreviewComponent } from '../../components/live-preview/live-preview.component';
import { CustomConfiguration, CustomRequestDetailDto, WizardStep, ProductType, mapFlatToNested, mapNestedToFlat } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LivePreviewComponent],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.css'
})
export class WizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  currentStep = signal<number>(1);
  totalSteps = 10;

  // Auto-Save UI Badges
  saveStatus = signal<'Saved' | 'Saving' | 'Unsaved'>('Saved');
  private debounceTimer: any;

  // Wizard Data Model
  configModel = signal<CustomConfiguration>({
    gender: 'Girl',
    size: '20 cm',
    bodyType: 'Normal',
    skinTone: '#ffe5d9',
    hairStyle: 'Long',
    hairColor: '#5c3d2e',
    hairLength: 'Medium',
    hairTexture: 'Straight',
    hairBangs: true,
    eyeColor: '#1e0e05',
    smileType: 'Happy',
    eyebrowStyle: 'Normal',
    hasFreckles: false,
    hasBlush: true,
    outfitCategory: 'Dress',
    outfitStyle: 'Casual',
    outfitColors: ['#c8813a', '#fffdf9'],
    accessories: [],
    personalizationName: '',
    personalizationMessage: '',
    personalizationDate: '',
    personalizationFont: 'Arial',
    personalizationTextColor: '#1e0e05'
  });

  // Reference Image Upload State
  uploadedImageUrl = signal<string | null>(null);
  uploadingImage = signal<boolean>(false);

  // Palettes Options
  skinTones = [
    { name: 'Ivory', hex: '#ffe5d9' },
    { name: 'Peach', hex: '#ffd3b6' },
    { name: 'Honey', hex: '#d8b18a' },
    { name: 'Golden', hex: '#b5835a' },
    { name: 'Cocoa', hex: '#8d5b4c' },
    { name: 'Dark', hex: '#5c3d2e' }
  ];

  hairColors = [
    { name: 'Blonde', hex: '#f4d068' },
    { name: 'Brown', hex: '#5c3d2e' },
    { name: 'Black', hex: '#1e0e05' },
    { name: 'Red', hex: '#d4503c' },
    { name: 'Pink', hex: '#ffb4a2' },
    { name: 'Blue', hex: '#a8dede' }
  ];

  eyeColors = [
    { name: 'Black', hex: '#1e0e05' },
    { name: 'Blue', hex: '#2a6f97' },
    { name: 'Green', hex: '#386641' },
    { name: 'Brown', hex: '#5c3d2e' }
  ];

  outfitColorsOptions = [
    '#c8813a', '#1e0e05', '#d4a96a', '#fffdf9', '#ffb4a2', '#a8dede', '#386641', '#e56b6f', '#f4d068'
  ];

  // Dynamic Option Lists based on Gender selection
  hairStylesOptions = computed(() => {
    const isGirl = this.configModel().gender === 'Girl';
    return isGirl 
      ? ['Long', 'Curly', 'Braids', 'Buns', 'Ponytail']
      : ['Short', 'Curly', 'Spiky'];
  });

  outfitCategoriesOptions = computed(() => {
    const isGirl = this.configModel().gender === 'Girl';
    return isGirl 
      ? ['Dress', 'Shirt', 'Hoodie']
      : ['Shirt', 'Overalls', 'Hoodie'];
  });

  accessoriesOptions = computed(() => {
    const isGirl = this.configModel().gender === 'Girl';
    return isGirl 
      ? ['Bag', 'Glasses', 'Flower']
      : ['Hat', 'Glasses', 'Scarf'];
  });

  // Check if configuration is complete enough to proceed to AI generation
  isConfigComplete = computed(() => {
    const c = this.configModel();
    return !!(c.gender && c.size && c.bodyType && c.skinTone && c.hairStyle && c.outfitCategory);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadRequest(id);
    } else {
      this.toastr.error('Invalid Request ID');
      this.router.navigate(['/custom-studio']);
    }
  }

  loadRequest(id: string): void {
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          if (res.data.referenceImageUrl) {
            this.uploadedImageUrl.set(res.data.referenceImageUrl);
          }
          if (res.data.customConfiguration?.configurationDataJson) {
            try {
              let savedConfig = JSON.parse(res.data.customConfiguration.configurationDataJson);
              if (savedConfig.Hair || savedConfig.Gender !== undefined || savedConfig.Outfit !== undefined) {
                savedConfig = mapNestedToFlat(savedConfig);
              }
              this.configModel.set({ ...this.configModel(), ...savedConfig });
            } catch (e) {
              console.error('Failed parsing saved configuration json:', e);
            }
          }
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load request configuration');
        console.error(err);
      }
    });
  }

  updateConfigField(field: keyof CustomConfiguration, value: any): void {
    this.configModel.update(c => {
      const updated = { ...c, [field]: value };
      
      // Dynamic defaults adjustments when gender changes
      if (field === 'gender') {
        if (value === 'Girl') {
          updated.hairStyle = 'Long';
          updated.outfitCategory = 'Dress';
          updated.hasBlush = true;
          updated.accessories = [];
        } else {
          updated.hairStyle = 'Short';
          updated.outfitCategory = 'Shirt';
          updated.hasBlush = false;
          updated.accessories = [];
        }
      }
      return updated;
    });
    this.onModelChange();
  }

  // Trigger Save with Debounce
  onModelChange(): void {
    this.saveStatus.set('Unsaved');
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.saveDraft();
    }, 1000);
  }

  saveDraft(): void {
    this.saveStatus.set('Saving');
    const nestedConfig = mapFlatToNested(this.configModel());
    const jsonStr = JSON.stringify(nestedConfig);
    this.customStudioService.saveConfiguration(this.requestId(), {
      requestId: this.requestId(),
      productType: ProductType.CrochetDoll,
      configurationDataJson: jsonStr
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.saveStatus.set('Saved');
        } else {
          this.saveStatus.set('Unsaved');
        }
      },
      error: (err) => {
        this.saveStatus.set('Unsaved');
        console.error(err);
      }
    });
  }

  // Navigation Steps
  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
      
      // Save progress milestone to backend
      let stepEnum = WizardStep.Initial;
      if (this.currentStep() >= 5 && this.currentStep() <= 7) {
        stepEnum = WizardStep.Styling;
      } else if (this.currentStep() >= 8) {
        stepEnum = WizardStep.Details;
      }
      this.customStudioService.saveWizardStep(this.requestId(), stepEnum).subscribe();
    }
  }

  // Selection Helpers
  toggleAccessory(acc: string): void {
    const list = [...this.configModel().accessories || []];
    const index = list.indexOf(acc);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(acc);
    }
    this.configModel.update(c => ({ ...c, accessories: list }));
    this.onModelChange();
  }

  setOutfitColor(color: string, index: number): void {
    const colors = [...this.configModel().outfitColors || ['#c8813a', '#fffdf9']];
    colors[index] = color;
    this.configModel.update(c => ({ ...c, outfitColors: colors }));
    this.onModelChange();
  }

  isDragging = signal<boolean>(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.uploadFile(file);
    }
  }

  // Image Upload Handlers
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
    }
  }

  private uploadFile(file: File): void {
    this.uploadingImage.set(true);
    this.customStudioService.uploadReferenceImage(this.requestId(), file).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        if (res.success && res.data) {
          this.uploadedImageUrl.set(res.data.referenceImageUrl || null);
          this.toastr.success('Reference image uploaded successfully!');
        }
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.toastr.error('Failed to upload image. Make sure it is a valid format (JPEG, PNG, WebP) and under 5MB.');
        console.error(err);
      }
    });
  }

  removeReferenceImage(): void {
    this.uploadedImageUrl.set(null);
    // Overwrite config to drop image
    this.customStudioService.saveConfiguration(this.requestId(), {
      requestId: this.requestId(),
      productType: ProductType.CrochetDoll,
      configurationDataJson: JSON.stringify(this.configModel())
    }).subscribe({
      next: () => {
        this.toastr.info('Reference image removed.');
      }
    });
  }

  // Review Page Navigation
  goToReview(): void {
    this.saveDraft();
    // Move to step 4 in the backend which signifies Review ready status
    this.customStudioService.saveWizardStep(this.requestId(), WizardStep.Review).subscribe({
      next: () => {
        this.router.navigate(['/custom-studio/summary', this.requestId()]);
      }
    });
  }

  trackByItem(index: number, item: any): any {
    return item?.id || item || index;
  }
}
