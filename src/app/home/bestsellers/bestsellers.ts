import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProductsService } from '../../products feature/services/products-service';
import { IProductSummary } from '../../shop feature/models/ishop-with-products';
import { ProductDetailResponse } from '../../products feature/models/product.model';
import { WishlistService } from '../../wishlist feature/services/wishlist-service';
import { CartApiService } from '../../orders/services/cart-api.service';
import { AuthService } from '../../auth/Services/auth';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bestsellers.html',
  styleUrls: ['./bestsellers.css']
})
export class BestsellersComponent implements OnInit {
  private productService = inject(ProductsService);
  private wishlistService = inject(WishlistService);
  private cartApi = inject(CartApiService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  products: IProductSummary[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  selectedProduct: IProductSummary | null = null;
  selectedProductDetails: ProductDetailResponse | null = null;
  loadingModalDetails: boolean = false;
  quantity: number = 1;
  currentImageIndex: number = 0;
  isClosing: boolean = false;
  wishlistedIds = new Set<string>();

  ngOnInit() {
    this.isLoading = true;
    this.productService.getProducts(1, 4).subscribe({
    
      next: (res: any) => {
        this.products = res.items;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.isLoading = false;
      }
    });

    this.wishlistService.getWishList().subscribe({
      next: (res) => {
        this.wishlistedIds = new Set(res.items.map(item => item.productId));
      },
      error: (err) => {
        console.error('Failed to load wishlist:', err);
      }
    });
  }

  getMainImage(product: IProductSummary): string {
    return product.mainImageUrl ?? '';
  }

  getModalImages(product: IProductSummary): string[] {
    if (this.selectedProductDetails && this.selectedProductDetails.images && this.selectedProductDetails.images.length > 0) {
      return this.selectedProductDetails.images.map(img => img.imageUrl);
    }
    return product.mainImageUrl ? [product.mainImageUrl] : [];
  }

  getCurrentModalImage(): string {
    if (!this.selectedProduct) return '';
    const images = this.getModalImages(this.selectedProduct);
    return images[this.currentImageIndex] ?? '';
  }

  goToImage(index: number) { this.currentImageIndex = index; }

  nextImage() {
    const images = this.getModalImages(this.selectedProduct!);
    if (images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    }
  }

  prevImage() {
    const images = this.getModalImages(this.selectedProduct!);
    if (images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
    }
  }

  openQuickView(product: IProductSummary) {
    this.selectedProduct = product;
    this.selectedProductDetails = null;
    this.loadingModalDetails = true;
    this.currentImageIndex = 0;
    this.quantity = 1;
    this.isClosing = false;
    document.body.style.overflow = 'hidden';

    this.productService.getProductById(product.id).subscribe({
      next: (details) => {
        this.selectedProductDetails = details;
        this.loadingModalDetails = false;
      },
      error: (err) => {
        console.error('Failed to load modal product details:', err);
        this.loadingModalDetails = false;
      }
    });
  }

  closeQuickView() {
    this.isClosing = true;
    setTimeout(() => {
      this.selectedProduct = null;
      this.selectedProductDetails = null;
      this.isClosing = false;
      document.body.style.overflow = 'auto';
    }, 800);
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    if (!this.selectedProduct) return;

    const productId = this.selectedProduct.id;
    const qty = this.quantity;

    this.cartApi.addItem(productId, qty).then((res) => {
      if (res) {
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تمت إضافة المنتج إلى السلة!'
            : 'Product added to cart!'
        );
        this.closeQuickView();
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

  isWishlisted(productId: string): boolean {
    return this.wishlistedIds.has(productId);
  }

  toggleWishlist(product: IProductSummary, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.isWishlisted(product.id)) {
      this.wishlistService.removeItem(product.id).subscribe({
        next: (res) => {
          this.wishlistedIds.delete(product.id);
          this.toastr.success(
            this.langService.currentLang() === 'ar'
              ? 'تمت إزالة المنتج من قائمة الأمنيات!'
              : 'Product removed from wishlist!'
          );
        },
        error: (err) => {
          console.error('Wishlist error:', err);
          this.toastr.error(
            this.langService.currentLang() === 'ar'
              ? 'فشل إزالة المنتج من قائمة الأمنيات.'
              : 'Failed to remove item from wishlist.'
          );
        }
      });
    } else {
      this.wishlistService.addItem(product.id).subscribe({
        next: (res) => {
          this.wishlistedIds.add(product.id);
          this.toastr.success(
            this.langService.currentLang() === 'ar'
              ? 'تمت إضافة المنتج إلى قائمة الأمنيات!'
              : 'Product added to wishlist!'
          );
        },
        error: (err) => {
          console.error('Wishlist error:', err);
          let errMsg = this.langService.currentLang() === 'ar'
            ? 'فشل إضافة المنتج لقائمة الأمنيات.'
            : 'Failed to add item to wishlist.';
          if (err?.error) {
            if (typeof err.error === 'object' && err.error.message) {
              errMsg = err.error.message;
            } else if (Array.isArray(err.error) && err.error.length > 0) {
              errMsg = err.error[0];
            } else if (typeof err.error === 'string') {
              errMsg = err.error;
            }
          }
          this.toastr.error(errMsg, '', { timeOut: 10000 });
        }
      });
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getDiscount(product: IProductSummary): number | null {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round((1 - product.discountPrice / product.price) * 100);
    }
    return null;
  }
}