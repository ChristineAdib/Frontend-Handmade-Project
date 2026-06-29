import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ProductType } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-photo-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.css'
})
export class PhotoComponent {
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  selectedPhotoUrl = signal<string | null>(null);
  selectedFileName = signal<string>('');
  selectedFile = signal<File | null>(null);
  generating = signal<boolean>(false);
  additionalNotes = '';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size exceeds the 5MB limit.');
      return;
    }

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedPhotoUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.selectedPhotoUrl.set(null);
  }

  startAiGeneration(): void {
    const file = this.selectedFile();
    if (!file) {
      this.toastr.warning('Please upload a photo first.');
      return;
    }

    this.generating.set(true);

    // Step 1: Initialize Custom Request
    this.customStudioService.createCustomRequest({
      productType: ProductType.CrochetDoll
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const requestId = res.data.id;

          // Step 2: Upload photo and trigger Gemini face analysis
          this.customStudioService.analyzePhotoForDoll(requestId, file).subscribe({
            next: (analysisRes) => {
              if (analysisRes.success && analysisRes.data) {
                // Step 3: Append user notes to the generated configuration
                let parsedConfig: any = {};
                try {
                  const configJson = analysisRes.data.customConfiguration?.configurationDataJson;
                  if (configJson) {
                    parsedConfig = JSON.parse(configJson);
                  }
                } catch (e) {}

                if (this.additionalNotes.trim()) {
                  parsedConfig.AdditionalNotes = this.additionalNotes.trim();
                }

                this.customStudioService.saveConfiguration(requestId, {
                  requestId: requestId,
                  productType: ProductType.CrochetDoll,
                  configurationDataJson: JSON.stringify(parsedConfig)
                }).subscribe({
                  next: () => {
                    this.generating.set(false);
                    this.toastr.success('Portrait analysis completed successfully!');
                    this.router.navigate(['/custom-studio/generating', requestId], { queryParams: { mode: 'photo' } });
                  },
                  error: () => {
                    // Fallback to routing directly if save fails
                    this.generating.set(false);
                    this.router.navigate(['/custom-studio/generating', requestId], { queryParams: { mode: 'photo' } });
                  }
                });
              } else {
                this.generating.set(false);
                this.toastr.error('Failed to analyze photo details.');
              }
            },
            error: (err) => {
              this.generating.set(false);
              const backendMsg = err?.error?.message || err?.error?.errors?.[0] || 'Unknown server error';
              this.toastr.error(`AI Portrait Analysis failed: ${backendMsg}`);
              console.error('Photo analysis error:', err);
            }
          });
        } else {
          this.generating.set(false);
          this.toastr.error('Failed to initialize request.');
        }
      },
      error: (err) => {
        this.generating.set(false);
        this.toastr.error('Network connection error.');
        console.error(err);
      }
    });
  }
}
