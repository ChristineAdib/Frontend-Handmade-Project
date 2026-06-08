import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile.service';
import { WishlistService } from '../../../wishlist feature/services/wishlist-service';
import { AuthService } from '../../../auth/Services/auth';
import { API_URLS } from '../../../constants/API_URLS';
import { UserProfile } from '../../models/user-profile';
import { FollowedShop } from '../../models/followed-shop';
import { UserReview } from '../../models/user-review';
import { OrderSummary } from '../../../orders/models/order-models';
import { IWishListItem } from '../../../wishlist feature/models/iwish-list-item';
import { OrderStatus, OrderStatusLabel } from '../../../orders/models/order-status';
import { PaymentStatus, PaymentStatusLabel } from '../../../payments/models/payment-status';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  protected readonly profileService = inject(ProfileService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  // Constants for status mapping
  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;
  PaymentStatusLabel = PaymentStatusLabel;

  // Signal States
  profile = signal<UserProfile | null>(null);
  followedShops = signal<FollowedShop[]>([]);
  recentOrders = signal<OrderSummary[]>([]);
  userReviews = signal<UserReview[]>([]);
  wishlistItems = signal<IWishListItem[]>([]);

  // Navigation State
  activeTab = signal<string>('Overview');
  sidebarOpen = signal<boolean>(false);

  // Loading States
  isLoadingProfile = signal<boolean>(false);
  isLoadingShops = signal<boolean>(false);
  isLoadingOrders = signal<boolean>(false);
  isLoadingReviews = signal<boolean>(false);
  isLoadingWishlist = signal<boolean>(false);

  // Computed Stats
  totalOrdersCount = computed(() => this.recentOrders().length);
  followedShopsCount = computed(() => this.followedShops().length);
  wishlistCount = computed(() => this.wishlistItems().length);
  reviewsCount = computed(() => this.userReviews().length);

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadProfile();
    this.loadFollowedShops();
    this.loadOrders();
    this.loadReviews();
    this.loadWishlist();
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.isLoadingProfile.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoadingProfile.set(false);
        this.toastr.error('Failed to load profile details.');
      }
    });
  }

  loadFollowedShops(): void {
    this.isLoadingShops.set(true);
    this.profileService.getFollowedShops().subscribe({
      next: (res) => {
        this.followedShops.set(res);
        this.isLoadingShops.set(false);
      },
      error: (err) => {
        console.error('Failed to load followed shops', err);
        this.isLoadingShops.set(false);
      }
    });
  }

  loadOrders(): void {
    this.isLoadingOrders.set(true);
    this.profileService.getOrders(1, 5).subscribe({
      next: (res) => {
        this.recentOrders.set(res.items);
        this.isLoadingOrders.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoadingOrders.set(false);
      }
    });
  }

  loadReviews(): void {
    this.isLoadingReviews.set(true);
    this.profileService.getMyReviews().subscribe({
      next: (res) => {
        this.userReviews.set(res);
        this.isLoadingReviews.set(false);
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoadingReviews.set(false);
      }
    });
  }

  loadWishlist(): void {
    this.isLoadingWishlist.set(true);
    this.wishlistService.getWishList().subscribe({
      next: (res) => {
        this.wishlistItems.set(res.items);
        this.isLoadingWishlist.set(false);
      },
      error: (err) => {
        console.error('Failed to load wishlist', err);
        this.isLoadingWishlist.set(false);
      }
    });
  }

  unfollowShop(shopId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to unfollow this shop?')) {
      this.http.delete(API_URLS.unfollowShop(shopId)).subscribe({
        next: () => {
          this.followedShops.update(prev => prev.filter(s => s.shopId !== shopId));
          this.toastr.success('Shop unfollowed successfully.');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to unfollow shop.');
        }
      });
    }
  }

  removeFromWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this item from your wishlist?')) {
      this.wishlistService.removeItem(productId).subscribe({
        next: (res) => {
          this.wishlistItems.set(res.items);
          this.toastr.success('Item removed from wishlist.');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to remove item.');
        }
      });
    }
  }

  selectTab(tab: string): void {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  logout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'status-pending';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Shipped: return 'status-shipped';
      case OrderStatus.Delivered: return 'status-delivered';
      case OrderStatus.Cancelled: return 'status-cancelled';
      case OrderStatus.Refunded: return 'status-refunded';
      default: return '';
    }
  }
}
