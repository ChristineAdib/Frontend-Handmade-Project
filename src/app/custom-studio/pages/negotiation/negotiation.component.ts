import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ChatService } from '../../../Chat/Services/chat.service';
import { ChatWindowComponent } from '../../../Chat/components/chat-window/chat-window.component';
import { CustomRequestDetailDto, GeneratedDesignDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-negotiation',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatWindowComponent],
  templateUrl: './negotiation.component.html',
  styleUrl: './negotiation.component.css'
})
export class NegotiationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private chatService = inject(ChatService);
  private toastr = inject(ToastrService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  selectedDesign = signal<GeneratedDesignDto | null>(null);
  loading = signal<boolean>(true);
  chatReady = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadDetailsAndStartChat(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  ngOnDestroy(): void {
    // Standard cleaning, do not disconnect SignalR entirely as background counts need to run
  }

  async loadDetailsAndStartChat(id: string): Promise<void> {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: async (res) => {
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          
          // Get selected design
          if (res.data.selectedDesignId && res.data.generatedDesigns) {
            const design = res.data.generatedDesigns.find(d => d.id === res.data.selectedDesignId);
            if (design) {
              this.selectedDesign.set(design);
            }
          }

          const sellerId = res.data.selectedSellerId || res.data.sellerRecommendations?.[0]?.shopId;
          if (sellerId) {
            try {
              // Initialize Real-time SignalR socket
              await this.chatService.initializeRealTime();
              // Load conversations list
              await this.chatService.loadConversations();
              // Start/get conversation by seller's shop ID
              const conversation = await this.chatService.startConversationByShop(sellerId.toString());
              // Open the chat room
              await this.chatService.openConversation(conversation);
              this.chatReady.set(true);
            } catch (err) {
              this.toastr.error('Failed to connect to artisan chat.');
              console.error(err);
            }
          } else {
            this.toastr.warning('No matched artisan found for this custom request.');
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load request workspace details');
        console.error(err);
      }
    });
  }

  downloadImage(url: string, name: string): void {
    this.toastr.info('Downloading design image...');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
