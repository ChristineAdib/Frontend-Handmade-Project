import { Component, inject, OnInit, signal, effect, computed, HostListener } from '@angular/core';
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
  maxStepReached = signal<number>(1);
  isPhotoMode = signal<boolean>(false);

  isStepVisible(step: number): boolean {
    if (this.isPhotoMode()) {
      return [2, 7, 8, 9].includes(step);
    }
    return true;
  }

  getVisibleSteps(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(s => this.isStepVisible(s));
  }

  isFirstStep(): boolean {
    const visible = this.getVisibleSteps();
    return visible.length > 0 && this.currentStep() === visible[0];
  }

  isLastStep(): boolean {
    const visible = this.getVisibleSteps();
    return visible.length > 0 && this.currentStep() === visible[visible.length - 1];
  }

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

  // Premium Options & Palettes
  skinTones = [
    { name: 'Ivory (Very Fair)', hex: '#ffe5d9', desc: 'Porcelain white undertone' },
    { name: 'Peach (Fair)', hex: '#ffd3b6', desc: 'Soft pink warm undertone' },
    { name: 'Honey (Golden)', hex: '#d8b18a', desc: 'Sun-kissed olive tone' },
    { name: 'Golden (Caramel)', hex: '#b5835a', desc: 'Rich honey bronze tone' },
    { name: 'Cocoa (Deep)', hex: '#8d5b4c', desc: 'Warm chestnut tone' },
    { name: 'Espresso (Dark)', hex: '#5c3d2e', desc: 'Velvet dark brown tone' }
  ];

  hairColors = [
    { name: 'Golden Blonde', hex: '#f4d068' },
    { name: 'Chestnut Brown', hex: '#5c3d2e' },
    { name: 'Midnight Black', hex: '#1e0e05' },
    { name: 'Auburn Red', hex: '#d4503c' },
    { name: 'Forest Green', hex: '#386641' },
    { name: 'Pastel Pink', hex: '#ffb4a2' },
    { name: 'Lavender Purple', hex: '#b5838d' }
  ];

  eyeColors = [
    { name: 'Midnight Black', hex: '#1e0e05' },
    { name: 'Ocean Blue', hex: '#2a6f97' },
    { name: 'Forest Green', hex: '#386641' },
    { name: 'Hazel Brown', hex: '#5c3d2e' },
    { name: 'Dreamy Violet', hex: '#7b2cbf' }
  ];

  outfitColorsOptions = [
    '#c8813a', '#1e0e05', '#d4a96a', '#fffdf9', '#ffb4a2', '#a8dede', '#386641', '#e56b6f', '#f4d068', '#457b9d', '#e63946'
  ];

  hairTextures = ['Straight', 'Wavy', 'Curly', 'Coily'];
  eyebrowStyles = ['Normal', 'Soft', 'Thick'];
  smileTypes = ['Happy', 'Grin', 'Cute', 'Shy'];

  outfitTemplates = [
    { name: 'Royal Princess Gown', category: 'Dress', style: 'Princess', desc: 'Flowing ruffled layers with lace finishes', icon: '👗', gender: 'Girl' },
    { name: 'Cozy Winter Hoodie', category: 'Hoodie', style: 'Hoodie', desc: 'Oversized weave with snug drawstring pockets', icon: '🧥', gender: 'Both' },
    { name: 'Classic Dungarees', category: 'Overalls', style: 'Overalls', desc: 'Hand-stitched denim overalls with wooden accents', icon: '👖', gender: 'Both' },
    { name: 'Forest Elf Tunic', category: 'Shirt', style: 'Elf', desc: 'Leaf-patterned tunic woven from woodland tones', icon: '🍃', gender: 'Both' },
    { name: 'Urban Casual Wear', category: 'Shirt', style: 'Casual', desc: 'Classic daily knit top with ribbed sleeves', icon: '👕', gender: 'Both' }
  ];

  // Dynamic Options list
  hairStylesOptions = computed(() => {
    const isGirl = this.configModel().gender === 'Girl';
    return isGirl 
      ? ['Long', 'Curly', 'Braids', 'Buns', 'Ponytail']
      : ['Short', 'Curly', 'Spiky', 'Slicked Back'];
  });

  filteredOutfits = computed(() => {
    const activeGender = this.configModel().gender;
    return this.outfitTemplates.filter(o => o.gender === 'Both' || o.gender === activeGender);
  });

  accessoriesOptions = computed(() => {
    const isGirl = this.configModel().gender === 'Girl';
    return isGirl 
      ? [
          { name: 'Bag', label: 'Leather Bag', icon: '👜', desc: 'Mini crossover shoulder bag' },
          { name: 'Glasses', label: 'Vintage Glasses', icon: '👓', desc: 'Retro round spectacles' },
          { name: 'Flower', label: 'Flower Pin', icon: '🌸', desc: 'Delicate blossom hair accessory' },
          { name: 'Hat', label: 'Cozy Winter Hat', icon: '🎩', desc: 'Handcrafted beanie pompom hat' },
          { name: 'Scarf', label: 'Woolen Scarf', icon: '🧣', desc: 'Warm double-knit neck scarf' }
        ]
      : [
          { name: 'Hat', label: 'Cozy Winter Hat', icon: '🎩', desc: 'Handcrafted beanie pompom hat' },
          { name: 'Glasses', label: 'Vintage Glasses', icon: '👓', desc: 'Retro round spectacles' },
          { name: 'Scarf', label: 'Woolen Scarf', icon: '🧣', desc: 'Warm double-knit neck scarf' }
        ];
  });

  isConfigComplete = computed(() => {
    const c = this.configModel();
    return !!(c.gender && c.size && c.bodyType && c.skinTone && c.hairStyle && c.outfitCategory);
  });

  /** Returns a short label of the user's selection for each completed step */
  getStepSummary(step: number): string {
    const c = this.configModel();
    switch (step) {
      case 1: return c.gender || '';
      case 2: return c.size || '';
      case 3: return c.bodyType || '';
      case 4: {
        const tone = this.skinTones.find(t => t.hex === c.skinTone);
        return tone ? tone.name.split(' ')[0] : '';
      }
      case 5: return c.hairStyle || '';
      case 6: return c.smileType || '';
      case 7: return c.outfitStyle || '';
      case 8: return c.accessories?.length ? `${c.accessories.length} item${c.accessories.length > 1 ? 's' : ''}` : 'None';
      case 9: return c.personalizationName || 'None';
      case 10: return this.uploadedImageUrl() ? 'Uploaded' : 'None';
      default: return '';
    }
  }

  /** Returns the overall completion percentage */
  getCompletionPercent(): number {
    const visible = this.getVisibleSteps();
    const completed = visible.filter(s => s < this.currentStep()).length;
    return Math.round((completed / visible.length) * 100);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.saveStatus() !== 'Saved') {
      $event.returnValue = true;
    }
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.customStudioService.resolveImageUrl(url);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'photo') {
        this.isPhotoMode.set(true);
        if (this.currentStep() === 1) {
          this.currentStep.set(2);
        }
      }
    });

    if (id) {
      this.requestId.set(id);
      this.loadRequest(id);
    } else {
      this.customStudioService.createCustomRequest({
        productType: ProductType.CrochetDoll
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.router.navigate(['/custom-studio/customize', res.data.id], { replaceUrl: true });
          } else {
            this.toastr.error('Failed to initialize customizing request');
            this.router.navigate(['/custom-studio']);
          }
        },
        error: () => {
          this.toastr.error('Connection error initializing customizing request');
          this.router.navigate(['/custom-studio']);
        }
      });
    }
  }

  loadRequest(id: string): void {
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const lockedStatuses = ['OfferAccepted', 'PaymentPending', 'Paid', 'InProgress', 'Completed'];
          if (lockedStatuses.includes(res.data.status)) {
            this.toastr.warning('This custom service design is locked because the offer has been accepted/approved.', 'Design Locked');
            if (res.data.conversationId) {
              this.router.navigate(['/chat', res.data.conversationId]);
            } else {
              this.router.navigate(['/custom-studio']);
            }
            return;
          }
          this.requestDetails.set(res.data);
          if (res.data.referenceImageUrl) {
            this.uploadedImageUrl.set(res.data.referenceImageUrl);
            this.isPhotoMode.set(true);
            this.configModel.update(c => ({ ...c, referenceImageUrl: res.data.referenceImageUrl }));
            if (this.currentStep() === 1) {
              this.currentStep.set(2);
            }
          }
          if (res.data.customConfiguration?.configurationDataJson) {
            try {
              let savedConfig = JSON.parse(res.data.customConfiguration.configurationDataJson);
              if (savedConfig.Hair || savedConfig.Gender !== undefined || savedConfig.Outfit !== undefined) {
                savedConfig = mapNestedToFlat(savedConfig);
              }
              this.configModel.set({ ...this.configModel(), ...savedConfig });
              this.maxStepReached.set(this.totalSteps); // restored draft -> allow jumping anywhere
              
              this.toastr.success('Draft restored from your last session.', 'Restored', {
                timeOut: 3000,
                progressBar: true,
                positionClass: 'toast-bottom-right'
              });
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
      
      // Dynamic adjustments when gender changes
      if (field === 'gender') {
        if (value === 'Girl') {
          updated.hairStyle = 'Long';
          updated.outfitCategory = 'Dress';
          updated.outfitStyle = 'Princess';
          updated.hasBlush = true;
          updated.accessories = [];
        } else {
          updated.hairStyle = 'Short';
          updated.outfitCategory = 'Shirt';
          updated.outfitStyle = 'Casual';
          updated.hasBlush = false;
          updated.accessories = [];
        }
      }
      return updated;
    });
    this.onModelChange();
  }

  selectOutfitTemplate(category: string, style: string): void {
    this.configModel.update(c => ({
      ...c,
      outfitCategory: category,
      outfitStyle: style
    }));
    this.onModelChange();
  }

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
    let prev = this.currentStep() - 1;
    while (prev >= 1 && !this.isStepVisible(prev)) {
      prev--;
    }
    if (prev >= 1) {
      this.currentStep.set(prev);
      // Save current state when going back
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.saveDraft();
    }
  }

  nextStep(): void {
    let next = this.currentStep() + 1;
    while (next <= this.totalSteps && !this.isStepVisible(next)) {
      next++;
    }
    if (next <= this.totalSteps) {
      this.currentStep.set(next);
      this.maxStepReached.update(m => Math.max(m, next));
      
      // Save progress milestone to backend
      let stepEnum = WizardStep.Initial;
      if (next >= 5 && next <= 7) {
        stepEnum = WizardStep.Styling;
      } else if (next >= 8) {
        stepEnum = WizardStep.Details;
      }
      this.customStudioService.saveWizardStep(this.requestId(), stepEnum).subscribe();

      // Immediately save the current configuration so the save badge updates
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.saveDraft();
    }
  }

  jumpToStep(step: number): void {
    if (this.isStepVisible(step) && step <= this.maxStepReached()) {
      this.currentStep.set(step);
      let stepEnum = WizardStep.Initial;
      if (step >= 5 && step <= 7) {
        stepEnum = WizardStep.Styling;
      } else if (step >= 8) {
        stepEnum = WizardStep.Details;
      }
      this.customStudioService.saveWizardStep(this.requestId(), stepEnum).subscribe();
      // Save current state when jumping
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.saveDraft();
    }
  }

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
    this.configModel.update(c => ({ ...c, referenceImageUrl: undefined }));
    const nestedConfig = mapFlatToNested(this.configModel());
    const jsonStr = JSON.stringify(nestedConfig);
    this.customStudioService.saveConfiguration(this.requestId(), {
      requestId: this.requestId(),
      productType: ProductType.CrochetDoll,
      configurationDataJson: jsonStr
    }).subscribe({
      next: () => {
        this.toastr.info('Reference image removed.');
      }
    });
  }

  goToReview(): void {
    this.saveDraft();
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
