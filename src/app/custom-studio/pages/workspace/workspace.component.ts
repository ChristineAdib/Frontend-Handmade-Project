import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomStudioService } from '../../services/custom-studio.service';
import { ProjectWorkspaceDto, CustomRequestDetailDto } from '../../models/custom-studio.models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/Services/auth';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customStudioService = inject(CustomStudioService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  requestId = signal<string>('');
  requestDetails = signal<CustomRequestDetailDto | null>(null);
  workspace = signal<ProjectWorkspaceDto | null>(null);
  loading = signal<boolean>(true);
  updatingProgress = signal<boolean>(false);
  uploadingPhoto = signal<boolean>(false);

  currentUserId = computed(() => this.authService.getUser()?.userId || '');
  isSeller = computed(() => {
    const details = this.requestDetails();
    return details !== null && this.currentUserId() !== details.buyerId;
  });

  // List of active milestones in crafting
  milestones = [
    { step: 0, name: 'Not Started', desc: 'Order placed, queuing.' },
    { step: 1, name: 'Material Selection', desc: 'Sourcing custom yarn & tags.' },
    { step: 2, name: 'Crochet Body', desc: 'Crafting doll base structure.' },
    { step: 3, name: 'Hair & Face details', desc: 'Crocheting hair & face styling.' },
    { step: 4, name: 'Outfit & Details', desc: 'Sewing custom dress & tags.' },
    { step: 5, name: 'Final Assembly', desc: 'Stitching accessories & final checks.' },
    { step: 6, name: 'Shipped', desc: 'Dispatched to delivery courier.' },
    { step: 7, name: 'Completed', desc: 'Delivered to buyer!' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(id);
      this.loadWorkspace(id);
    } else {
      this.router.navigate(['/custom-studio']);
    }
  }

  loadWorkspace(id: string): void {
    this.loading.set(true);
    this.customStudioService.getCustomRequestDetails(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to load project workspace details');
        console.error(err);
      }
    });
  }

  getStatusClass(step: number): string {
    const w = this.workspace();
    if (!w) return 'pending';
    
    if (w.milestoneStep > step) {
      return 'completed';
    } else if (w.milestoneStep === step) {
      return 'active';
    }
    return 'pending';
  }

  incrementMilestone(): void {
    const w = this.workspace();
    if (!w) return;
    this.updatingProgress.set(true);
    this.customStudioService.updateWorkspaceProgress(this.requestId(), w.milestoneStep + 1).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Crafting milestone updated successfully');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to update crafting milestone');
        console.error(err);
      }
    });
  }

  shipProject(trackingNumber: string): void {
    if (!trackingNumber.trim()) {
      this.toastr.error('Please enter a tracking number.');
      return;
    }
    this.updatingProgress.set(true);
    this.customStudioService.updateWorkspaceProgress(this.requestId(), 6, trackingNumber).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Project marked as Shipped!');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to register shipping details');
        console.error(err);
      }
    });
  }

  uploadPhoto(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.uploadingPhoto.set(true);
    this.customStudioService.uploadWorkspacePhoto(this.requestId(), file).subscribe({
      next: (res) => {
        this.uploadingPhoto.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Workspace progress photo uploaded!');
        }
        element.value = '';
      },
      error: (err) => {
        this.uploadingPhoto.set(false);
        this.toastr.error('Failed to upload workspace photo');
        console.error(err);
        element.value = '';
      }
    });
  }

  confirmDelivery(): void {
    this.updatingProgress.set(true);
    this.customStudioService.confirmWorkspaceDelivery(this.requestId()).subscribe({
      next: (res) => {
        this.updatingProgress.set(false);
        if (res.success && res.data) {
          this.requestDetails.set(res.data);
          this.workspace.set(res.data.projectWorkspace || null);
          this.toastr.success('Delivery confirmed! Custom order successfully completed.');
        }
      },
      error: (err) => {
        this.updatingProgress.set(false);
        this.toastr.error('Failed to confirm delivery');
        console.error(err);
      }
    });
  }
}
