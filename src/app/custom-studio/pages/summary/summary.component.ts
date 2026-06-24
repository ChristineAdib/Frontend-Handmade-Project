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
}
