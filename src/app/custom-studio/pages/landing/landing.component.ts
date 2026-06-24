import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ProductType } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  private customStudioService = inject(CustomStudioService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  latestDraftId = signal<string | null>(null);
  loadingDraft = signal<boolean>(false);

  // Pre-configured craft examples for crochet dolls to showcase aesthetics
  dollExamples = [
    { name: 'Princess Amigurumi', image: 'https://images.unsplash.com/photo-1584992772048-2b86ab25f85e?q=80&w=600&auto=format&fit=crop', desc: 'Custom pastel pink gown with braided blonde buns.' },
    { name: 'Little Sailor Boy', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop', desc: 'Cute nautical stripes with a knitted captain hat.' },
    { name: 'Fantasy Forest Elf', image: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=600&auto=format&fit=crop', desc: 'Forest green outfits with matching leaf headbands.' }
  ];

  ngOnInit(): void {
    this.checkForLatestDraft();
  }

  checkForLatestDraft(): void {
    this.customStudioService.getBuyerRequests(1, 5).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.items.length > 0) {
          // Find the most recent draft or configuring request
          const draft = res.data.items.find(
            item => item.status === 'Draft' || item.status === 'Configuring'
          );
          if (draft) {
            this.latestDraftId.set(draft.id);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load drafts:', err);
      }
    });
  }

  createNewRequest(): void {
    this.loadingDraft.set(true);
    // Create custom crochet doll request on backend
    this.customStudioService.createCustomRequest({
      productType: ProductType.CrochetDoll
    }).subscribe({
      next: (res) => {
        this.loadingDraft.set(false);
        if (res.success && res.data) {
          this.toastr.success('Custom Doll request initialized!');
          this.router.navigate(['/custom-studio/wizard', res.data.id]);
        } else {
          this.toastr.error('Failed to initialize request');
        }
      },
      error: (err) => {
        this.loadingDraft.set(false);
        this.toastr.error('An error occurred. Please try again.');
        console.error(err);
      }
    });
  }

  continueDraft(): void {
    const draftId = this.latestDraftId();
    if (draftId) {
      this.router.navigate(['/custom-studio/wizard', draftId]);
    }
  }
}
