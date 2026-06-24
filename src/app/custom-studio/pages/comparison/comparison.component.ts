import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { CustomRequestDetailDto, GeneratedDesignDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  designA = signal<GeneratedDesignDto | null>(null);
  designB = signal<GeneratedDesignDto | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadComparisonData(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadComparisonData(id: string): void {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          const designs = res.data.generatedDesigns || [];
          if (designs.length >= 2) {
            this.designA.set(designs[0]);
            this.designB.set(designs[1]);
          } else if (designs.length === 1) {
            this.designA.set(designs[0]);
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load comparison data');
        console.error(err);
      }
    });
  }

  selectDesign(designId: string): void {
    this.customStudioService.selectGeneratedDesign(this.requestId(), designId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Design selected!');
          this.router.navigate(['/custom-studio/summary', this.requestId()]);
        }
      }
    });
  }
}
