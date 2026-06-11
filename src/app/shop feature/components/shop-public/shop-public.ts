import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { ShopService } from '../../services/shop-service';
import { FollowService } from '../../../follow feature/services/follow-service';
import { AuthService } from '../../../auth/Services/auth';
import { CartApiService } from '../../../orders/services/cart-api.service';
import { IShopWithProducts, IProductSummary } from '../../models/ishop-with-products';
import { LanguageService } from '../../../core/services/language.service';

type ActiveTab = 'products' | 'about' | 'reviews';

@Component({
  selector: 'app-shop-public',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop-public.html',
  styleUrl: './shop-public.css',
})
export class ShopPublic implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private followService = inject(FollowService);
  private auth = inject(AuthService);
  private cartApi = inject(CartApiService);
  private toastr = inject(ToastrService);
  protected langService = inject(LanguageService);

  shop = signal<IShopWithProducts | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<ActiveTab>('products');
  isFollowing = signal(false);
  isFollowLoading = signal(false);
  shopId = signal('');

  // Reviews state
  reviews = signal<any[]>([]);
  reviewsPageIndex = signal(1);
  reviewsPageSize = signal(5);
  reviewsTotalPages = signal(1);
  reviewsTotalCount = signal(0);
  reviewsHasNext = signal(false);
  reviewsHasPrevious = signal(false);
  loadingReviews = signal(false);

  // New review form state
  newRating = signal(5);
  newComment = signal('');
  hoveredRating = signal(0);
  isSubmittingReview = signal(false);
  isUserLoggedIn = signal(false);

  // User's own review for the shop (if exists)
  myReview = signal<any | null>(null);
  isEditing = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.shopId.set(id);
    this.isUserLoggedIn.set(this.auth.isLoggedIn());

    this.shopService.getShopWithProducts(id).subscribe({
      next: res => {
        this.shop.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(this.langService.translate('failedToLoadShop'));
        this.isLoading.set(false);
      }
    });

    if (this.auth.isLoggedIn()) {
      this.followService.isFollowing(id).subscribe({
        next: val => this.isFollowing.set(val)
      });
      this.loadUserReview();
    }
    this.loadReviews();
  }

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }

  toggleFollow() {
    if (!this.auth.isLoggedIn()) return;
    this.isFollowLoading.set(true);
    const id = this.shopId();

    if (this.isFollowing()) {
      this.followService.unfollowShop(id).subscribe({
        next: () => { this.isFollowing.set(false); this.isFollowLoading.set(false); },
        error: () => this.isFollowLoading.set(false)
      });
    } else {
      this.followService.followShop(id).subscribe({
        next: () => { this.isFollowing.set(true); this.isFollowLoading.set(false); },
        error: () => this.isFollowLoading.set(false)
      });
    }
  }

  quickAdd(productId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.toastr.warning(
        this.langService.currentLang() === 'ar'
          ? 'الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.'
          : 'Please log in first to add items to your cart.'
      );
      return;
    }

    this.cartApi.addItem(productId, 1).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة!'
            : 'Product added to cart!'
        );
      } else {
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'فشل إضافة المنتج إلى السلة.'
            : 'Failed to add item to cart.'
        );
      }
    }).catch(err => {
      console.error('Quick add error:', err);
      this.toastr.error('Failed to add item to cart.');
    });
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
  goToChat() {
    this.router.navigate(['/chat', this.shopId()]);
  }

  loadReviews() {
    this.loadingReviews.set(true);
    this.shopService.getShopReviews(this.shopId(), this.reviewsPageIndex(), this.reviewsPageSize()).subscribe({
      next: res => {
        this.reviews.set(res.items || []);
        this.reviewsTotalCount.set(res.totalCount || 0);
        this.reviewsTotalPages.set(res.totalPages || 1);
        this.reviewsHasNext.set(res.pageNumber < res.totalPages);
        this.reviewsHasPrevious.set(res.pageNumber > 1);
        this.loadingReviews.set(false);
      },
      error: err => {
        console.error('Failed to load reviews', err);
        this.loadingReviews.set(false);
      }
    });
  }

  loadUserReview() {
    if (!this.auth.isLoggedIn()) return;
    this.shopService.getUserReviewForShop(this.shopId()).subscribe({
      next: res => {
        this.myReview.set(res);
        // Pre-fill form in case they want to edit
        this.newRating.set(res.rating);
        this.newComment.set(res.comment || '');
      },
      error: () => {
        this.myReview.set(null);
      }
    });
  }

  submitReview() {
    if (this.newRating() < 1 || this.newRating() > 5) {
      this.toastr.warning('Please select a rating between 1 and 5 stars.');
      return;
    }

    this.isSubmittingReview.set(true);
    const commentVal = this.newComment().trim() || null;

    if (this.myReview()) {
      // Update Mode
      const dto = {
        rating: this.newRating(),
        comment: commentVal
      };
      this.shopService.updateShopReview(this.myReview().id, dto).subscribe({
        next: (res) => {
          this.toastr.success(this.langService.translate('reviewSuccess'));
          this.myReview.set(res);
          this.isEditing.set(false);
          this.isSubmittingReview.set(false);
          this.loadReviews();
          this.reloadShopData();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error?.message || 'Failed to update review.');
          this.isSubmittingReview.set(false);
        }
      });
    } else {
      // Create Mode
      const dto = {
        shopId: this.shopId(),
        rating: this.newRating(),
        comment: commentVal
      };
      this.shopService.createShopReview(dto).subscribe({
        next: (res) => {
          this.toastr.success(this.langService.translate('reviewSuccess'));
          this.myReview.set(res);
          this.isSubmittingReview.set(false);
          this.loadReviews();
          this.reloadShopData();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error?.[0] || err.error?.message || 'Failed to submit review. Only customers who completed a purchase from this shop can review.');
          this.isSubmittingReview.set(false);
        }
      });
    }
  }

  deleteReview() {
    if (!this.myReview()) return;
    if (confirm(this.langService.translate('deleteReviewConfirm'))) {
      this.isSubmittingReview.set(true);
      this.shopService.deleteShopReview(this.myReview().id).subscribe({
        next: () => {
          this.toastr.success(this.langService.translate('reviewDeleteSuccess'));
          this.myReview.set(null);
          this.newRating.set(5);
          this.newComment.set('');
          this.isEditing.set(false);
          this.isSubmittingReview.set(false);
          this.loadReviews();
          this.reloadShopData();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to delete review.');
          this.isSubmittingReview.set(false);
        }
      });
    }
  }

  reloadShopData() {
    this.shopService.getShopWithProducts(this.shopId()).subscribe({
      next: res => {
        this.shop.set(res);
      }
    });
  }

  onReviewsPageChange(page: number) {
    this.reviewsPageIndex.set(page);
    this.loadReviews();
  }

  getStarsArray(rating: number): number[] {
    const stars = Math.round(rating);
    return Array(stars).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    const stars = Math.round(rating);
    return Array(Math.max(0, 5 - stars)).fill(0);
  }

  setNewRating(rating: number): void {
    this.newRating.set(rating);
  }

  onStarMouseEnter(star: number): void {
    this.hoveredRating.set(star);
  }

  onStarMouseLeave(): void {
    this.hoveredRating.set(0);
  }

  scrollToWriteReview() {
    this.setTab('reviews');
    setTimeout(() => {
      const element = document.getElementById('reviewComment') || document.querySelector('.write-review-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const textarea = element.querySelector('textarea') || element;
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus();
        }
      }
    }, 100);
  }
}