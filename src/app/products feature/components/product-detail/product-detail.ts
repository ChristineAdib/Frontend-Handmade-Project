import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { ProductsService } from '../../services/products-service';
import { AuthService } from '../../../auth/Services/auth';
import { LanguageService } from '../../../core/services/language.service';
import { ProductDetailResponse, ReviewResponse, CreateReviewRequest } from '../../models/product.model';
import { CartApiService, CartItemDto } from '../../../orders/services/cart-api.service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { WishlistService } from '../../../wishlist feature/services/wishlist-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  public langService = inject(LanguageService);
  private router = inject(Router);
  private cartApiService = inject(CartApiService);
  private shopService = inject(ShopService);
  private wishlistService = inject(WishlistService);

  productId: string | null = null;
  product: ProductDetailResponse | null = null;
  loadingProduct = true;
  activeImageUrl: string = '';
  isProductOwner = false;

  // Reviews list states
  reviews: ReviewResponse[] = [];
  loadingReviews = false;
  reviewsPageIndex = 1;
  reviewsPageSize = 5;
  reviewsTotalCount = 0;
  reviewsTotalPages = 1;
  reviewsHasNext = false;
  reviewsHasPrevious = false;

  // Review submission form states
  isUserLoggedIn = false;
  newRating = 5;
  newComment = '';
  isSubmittingReview = false;
  hoveredRating = 0;

  // Verified purchase eligibility states
  isEligibleToReview = false;
  alreadyReviewed = false;
  existingReviewId: string | null = null;
  checkingEligibility = false;
  isGeneratingAiSummary = false;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isUserLoggedIn = this.authService.isLoggedIn();
    
    if (this.productId) {
      this.loadProduct(this.productId);
    } else {
      this.loadingProduct = false;
    }
  }

  loadProduct(id: string): void {
    this.loadingProduct = true;
    this.productsService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        if (data.images && data.images.length > 0) {
          const mainImg = data.images.find(img => img.isMain) || data.images[0];
          this.activeImageUrl = mainImg.imageUrl;
        } else {
          this.activeImageUrl = 'assets/images/placeholder.jpg';
        }
        this.loadingProduct = false;
        this.checkProductOwnership();
        this.loadReviews();
        this.checkEligibility();
      },
      error: (err) => {
        console.error('Error loading product details:', err);
        this.toastr.error(this.langService.translate('productNotFound'));
        this.loadingProduct = false;
      }
    });
  }

  checkEligibility(): void {
    if (!this.productId || !this.isUserLoggedIn) return;
    this.checkingEligibility = true;
    this.productsService.checkReviewEligibility(this.productId).subscribe({
      next: (res) => {
        this.isEligibleToReview = res.isEligible;
        this.alreadyReviewed = res.alreadyReviewed;
        this.existingReviewId = res.existingReviewId;
        if (res.alreadyReviewed) {
          this.newRating = res.existingRating;
          this.newComment = res.existingComment || '';
        }
        this.checkingEligibility = false;
      },
      error: (err) => {
        console.error('Error checking review eligibility:', err);
        this.isEligibleToReview = false;
        this.checkingEligibility = false;
      }
    });
  }

  checkProductOwnership(): void {
    if (!this.isUserLoggedIn || !this.product) {
      this.isProductOwner = false;
      return;
    }

    const user = this.authService.getUser();
    const isSeller = user?.roles?.includes('Seller');
    if (!isSeller) {
      this.isProductOwner = false;
      return;
    }

    this.shopService.getMyShop().subscribe({
      next: (myShop) => {
        if (myShop && this.product) {
          this.isProductOwner = (myShop.id === this.product.shopId);
        }
      },
      error: (err) => {
        console.error('Error fetching my shop:', err);
        this.isProductOwner = false;
      }
    });
  }

  loadReviews(): void {
    if (!this.productId) return;
    this.loadingReviews = true;

    this.productsService.getProductReviews(this.productId, this.reviewsPageIndex, this.reviewsPageSize).subscribe({
      next: (res) => {
        this.reviews = res.items || [];
        this.reviewsTotalCount = res.totalCount || 0;
        this.reviewsTotalPages = res.totalPages || 1;
        this.reviewsHasNext = res.hasNext || false;
        this.reviewsHasPrevious = res.hasPrevious || false;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews = false;
      }
    });
  }

  changeActiveImage(url: string): void {
    this.activeImageUrl = url;
  }

  setNewRating(rating: number): void {
    this.newRating = rating;
  }

  onStarMouseEnter(star: number): void {
    this.hoveredRating = star;
  }

  onStarMouseLeave(): void {
    this.hoveredRating = 0;
  }

  onReviewsPageChange(page: number): void {
    this.reviewsPageIndex = page;
    this.loadReviews();
  }

  submitReview(): void {
    if (!this.productId) return;

    if (this.newRating < 1 || this.newRating > 5) {
      this.toastr.warning('Please select a rating between 1 and 5 stars.');
      return;
    }

    this.isSubmittingReview = true;

    const request: CreateReviewRequest = {
      productId: this.productId,
      rating: this.newRating,
      comment: this.newComment.trim() || undefined
    };

    const operation$ = this.alreadyReviewed && this.existingReviewId
      ? this.productsService.updateReview(this.existingReviewId, request)
      : this.productsService.createReview(request);

    operation$.subscribe({
      next: (res) => {
        this.toastr.success(
          this.langService.currentLang() === 'ar' 
            ? 'تم حفظ تقييمك بنجاح. شكراً لك!' 
            : 'Your review was saved successfully. Thank you!'
        );
        this.isSubmittingReview = false;
        
        // Refresh product details (to update averageRating and reviewCount) and reviews list
        if (this.productId) {
          this.loadProduct(this.productId);
        }
      },
      error: (err: any) => {
        console.error('Error submitting review:', err);
        const errorMsg = err?.error?.message || (this.langService.currentLang() === 'ar'
          ? 'فشل تقديم التقييم.'
          : 'Failed to submit review.');
        this.toastr.error(errorMsg);
        this.isSubmittingReview = false;
      }
    });
  }

  generateAiSummary(): void {
    if (!this.productId) return;

    this.isGeneratingAiSummary = true;

    this.productsService.generateAiSummary(this.productId).subscribe({
      next: (res) => {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تم توليد ملخص الذكاء الاصطناعي بنجاح!'
            : 'AI Review Summary generated successfully!'
        );
        
        // Reload only product details to show the new summary
        this.productsService.getProductById(this.productId!).subscribe({
          next: (data) => {
            this.product = data;
            this.isGeneratingAiSummary = false;
          },
          error: (err) => {
            console.error('Error reloading product summary:', err);
            this.isGeneratingAiSummary = false;
          }
        });
      },
      error: (err) => {
        console.error('Error generating AI summary:', err);
        const errorMsg = err?.error?.message || (this.langService.currentLang() === 'ar'
          ? 'فشل توليد ملخص الذكاء الاصطناعي. تأكد من وجود 5 مراجعات على الأقل.'
          : 'Failed to generate AI summary. Make sure there are at least 5 reviews.');
        this.toastr.error(errorMsg);
        this.isGeneratingAiSummary = false;
      }
    });
  }

  // Star rendering helper functions
  getStarsArray(rating: number): number[] {
    const stars = Math.round(rating);
    return Array(stars).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    const stars = Math.round(rating);
    return Array(Math.max(0, 5 - stars)).fill(0);
  }

  buyNow(): void {
    if (!this.productId) return;

    if (!this.authService.isLoggedIn()) {
      this.toastr.warning(
        this.langService.currentLang() === 'ar'
          ? 'الرجاء تسجيل الدخول أولاً لإجراء عملية الشراء.'
          : 'Please log in first to proceed with the purchase.'
      );
      this.router.navigate(['/login']);
      return;
    }

    this.cartApiService.addItem(this.productId, 1).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة والتحويل للدفع!'
            : 'Product added to cart! Proceeding to checkout.'
        );
        this.router.navigate(['/checkout']);
      } else {
        const errMsg = this.cartApiService.error() || (this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.');
        this.toastr.error(errMsg, '', { timeOut: 10000 });
      }
    }).catch(err => {
      console.error('Cart error:', err);
      this.toastr.error(this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.', '', { timeOut: 10000 });
    });
  }

  addToCart(): void {
    if (!this.productId) return;

    this.cartApiService.addItem(this.productId, 1).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة!'
            : 'Added to cart successfully!'
        );
      } else {
        const errMsg = this.cartApiService.error() || (this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.');
        this.toastr.error(errMsg);
      }
    }).catch(err => {
      console.error('Cart error:', err);
      this.toastr.error(this.langService.currentLang() === 'ar' ? 'فشل إضافة المنتج إلى السلة.' : 'Failed to add item to cart.');
    });
  }

  isWishlisted(): boolean {
    const list = this.wishlistService.wishlist();
    if (!list || !list.items || !this.productId) return false;
    return list.items.some(item => item.productId === this.productId);
  }

  toggleWishlist(): void {
    if (!this.productId) return;

    if (this.isWishlisted()) {
      this.wishlistService.removeItem(this.productId).subscribe({
        next: () => {
          this.toastr.success(
            this.langService.currentLang() === 'ar'
              ? 'تمت إزالة المنتج من قائمة الأمنيات'
              : 'Removed from wishlist successfully'
          );
        },
        error: (err) => {
          this.toastr.error(
            this.langService.currentLang() === 'ar'
              ? 'فشل إزالة المنتج.'
              : 'Failed to remove product from wishlist.'
          );
        }
      });
    } else {
      this.wishlistService.addItem(this.productId).subscribe({
        next: () => {
          this.toastr.success(
            this.langService.currentLang() === 'ar'
              ? 'تمت إضافة المنتج إلى قائمة الأمنيات!'
              : 'Added to wishlist successfully!'
          );
        },
        error: (err) => {
          this.toastr.error(
            this.langService.currentLang() === 'ar'
              ? 'فشل إضافة المنتج لقائمة الأمنيات.'
              : 'Failed to add product to wishlist.'
          );
        }
      });
    }
  }
}
