import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowService } from '../../../follow feature/services/follow-service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { IShopFollower } from '../../../follow feature/models/ishop-follower';

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './followers.html',
  styleUrl: './followers.css',
})
export class Followers implements OnInit {
  private followService = inject(FollowService);
  private shopService = inject(ShopService);

  followers = signal<IShopFollower[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: shop => {
        this.followService.getShopFollowers(shop.id).subscribe({
          next: followers => {
            this.followers.set(followers);
            this.isLoading.set(false);
          },
          error: () => {
            this.error.set('Failed to load followers');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Failed to load shop');
        this.isLoading.set(false);
      }
    });
  }
}