import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../products feature/services/products-service';
import { IProductSummary } from '../../shop feature/models/ishop-with-products';

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bestsellers.html',
  styleUrls: ['./bestsellers.css']
})
export class BestsellersComponent implements OnInit {
  products: IProductSummary[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  selectedProduct: IProductSummary | null = null;
  quantity: number = 1;
  currentImageIndex: number = 0;
  isClosing: boolean = false;

 constructor(private productService: ProductsService) {}

 ngOnInit() {
  this.isLoading = true;
  this.productService.getProducts(1, 8).subscribe({
    next: (res: any) => {
      this.products = res.items;
      this.isLoading = false;
    },
    error: () => {
      this.error = 'Failed to load products.';
      this.isLoading = false;
    }
  });
}

  getMainImage(product: IProductSummary): string {
    return product.mainImageUrl ?? '';
  }

  getModalImages(product: IProductSummary): string[] {
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
    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
  }

  prevImage() {
    const images = this.getModalImages(this.selectedProduct!);
    this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
  }

  openQuickView(product: IProductSummary) {
    this.selectedProduct = product;
    this.currentImageIndex = 0;
    this.isClosing = false;
    document.body.style.overflow = 'hidden';
  }

  closeQuickView() {
    this.isClosing = true;
    setTimeout(() => {
      this.selectedProduct = null;
      this.isClosing = false;
      document.body.style.overflow = 'auto';
    }, 800);
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    console.log('Added to cart:', this.selectedProduct?.titleEn, 'Qty:', this.quantity);
    this.closeQuickView();
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