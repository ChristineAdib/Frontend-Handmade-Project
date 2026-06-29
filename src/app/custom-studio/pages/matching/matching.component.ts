import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { SellerRecommendationDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './matching.component.html',
  styleUrl: './matching.component.css'
})
export class MatchingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  recommendations = signal<SellerRecommendationDto[]>([]);
  loading = signal<boolean>(true);
  chatLoading = signal<string | null>(null); // shopId being opened

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadSellers(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadSellers(id: string): void {
    this.loading.set(true);
    this.customStudioService.getRecommendedSellers(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.recommendations.set(res.data);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load recommended sellers');
        console.error(err);
      }
    });
  }

  startDiscussion(sellerShopId: string): void {
    this.chatLoading.set(sellerShopId);
    this.toastr.info('Opening discussion...');
    
    this.customStudioService.createDiscussion(this.requestId(), sellerShopId).subscribe({
      next: (res) => {
        this.chatLoading.set(null);
        if (res.success && res.data) {
          this.toastr.success('Conversation initialized!');
          const convId = res.data.id || res.data.conversationId;
          this.router.navigate(['/chat', convId], { queryParams: { requestId: this.requestId() } });
        } else {
          this.toastr.error('Failed to start chat discussion');
        }
      },
      error: (err) => {
        this.chatLoading.set(null);
        this.toastr.error('An error occurred while opening conversation.');
        console.error(err);
      }
    });
  }
}
