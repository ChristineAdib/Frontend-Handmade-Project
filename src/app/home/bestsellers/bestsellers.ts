import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  hoverImage: string;
  category: string;
  tags: string[];
}

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bestsellers.html',
  styleUrls: ['./bestsellers.css']
})
export class BestsellersComponent {
  selectedProduct: Product | null = null;
  quantity: number = 1;
  currentImageIndex: number = 0;
  isClosing: boolean = false;

  products: Product[] = [
    {
      id: 1,
      name: 'Bamboo Suction Spoon',
      price: 26.39,
      rating: 5,
      reviews: 12,
      image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a3d69e?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      category: 'Kitchen Tools',
      tags: ['Bamboo', 'Crafts', 'Handmade']
    },
    {
      id: 2,
      name: 'Rectangular Woodchip Picnic Basket',
      price: 70.74,
      oldPrice: 472.32,
      discount: 85,
      rating: 4,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
      category: 'Storage',
      tags: ['Wood', 'Handmade', 'Natural']
    },
    {
      id: 3,
      name: 'Bamboo Serving Tray',
      price: 757.30,
      rating: 4,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      category: 'Serving',
      tags: ['Bamboo', 'Crafts']
    },
    {
      id: 4,
      name: 'Custom Bamboo Cutting Boards',
      price: 41.96,
      rating: 4,
      reviews: 5,
      image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=80',
      category: 'Kitchen Tools',
      tags: ['Bamboo', 'Crafts', 'Handmade', 'Natural']
    },
    {
      id: 5,
      name: 'Poppy Nesting Floor Baskets',
      price: 632.31,
      rating: 4,
      reviews: 20,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&q=80',
      category: 'Storage',
      tags: ['Natural', 'Handmade']
    },
    {
      id: 6,
      name: 'Bread Crumb Catcher',
      price: 125.81,
      oldPrice: 311.04,
      discount: 60,
      rating: 4,
      reviews: 10,
      image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a3d69e?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      category: 'Kitchen Tools',
      tags: ['Wood', 'Crafts']
    },
    {
      id: 7,
      name: 'Kulae Sport Yoga Towel',
      price: 74.98,
      oldPrice: 150.11,
      discount: 50,
      rating: 5,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
      category: 'Sports',
      tags: ['Natural', 'Handmade']
    },
    {
      id: 8,
      name: 'Vegetable And Nail Brush',
      price: 268.76,
      rating: 4,
      reviews: 7,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
      category: 'Personal Care',
      tags: ['Natural', 'Handmade']
    }
  ];

  getModalImages(product: Product): string[] {
    return [product.image, product.hoverImage];
  }

  getCurrentModalImage(): string {
    if (!this.selectedProduct) return '';
    const images = this.getModalImages(this.selectedProduct);
    return images[this.currentImageIndex];
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }

  nextImage() {
    const images = this.getModalImages(this.selectedProduct!);
    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
  }

  prevImage() {
    const images = this.getModalImages(this.selectedProduct!);
    this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
  }

  openQuickView(product: Product) {
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

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    console.log('Added to cart:', this.selectedProduct?.name, 'Quantity:', this.quantity);
    this.closeQuickView();
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}