import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { ProductsService } from '../../services/products-service';
import { AuthService } from '../../../auth/Services/auth';
import { LanguageService } from '../../../core/services/language.service';
import { ProductDetailResponse, ReviewResponse, CreateReviewRequest } from '../../models/product.model';
import { CartApiService } from '../../../orders/services/cart-api.service';

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

  productId: string | null = null;
  product: ProductDetailResponse | null = null;
  loadingProduct = true;
  activeImageUrl: string = '';

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
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error loading product details:', err);
        this.toastr.error(this.langService.translate('productNotFound'));
        this.loadingProduct = false;
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

    this.productsService.createReview(request).subscribe({
      next: (res) => {
        this.toastr.success(
          this.langService.currentLang() === 'ar' 
            ? 'تمت إضافة مراجعتك بنجاح. شكراً لك!' 
            : 'Your review was submitted successfully. Thank you!'
        );
        this.newRating = 5;
        this.newComment = '';
        this.isSubmittingReview = false;
        
        // Refresh product details (to update averageRating and reviewCount) and reviews list
        if (this.productId) {
          this.loadProduct(this.productId);
        }
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'فشل تقديم التقييم. قد تكون قمت بتقييم هذا المنتج بالفعل.'
            : 'Failed to submit review. You may have already reviewed this product.'
        );
        this.isSubmittingReview = false;
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
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'فشل إضافة المنتج إلى السلة.'
            : 'Failed to add item to cart.'
        );
      }
    }).catch(err => {
      console.error('Cart error:', err);
      this.toastr.error('Failed to add item to cart.');
    });
  }
}
