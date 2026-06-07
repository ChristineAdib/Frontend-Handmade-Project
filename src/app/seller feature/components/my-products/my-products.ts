import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProduct } from '../add-product/add-product';
import { ProductService } from '../../../seller feature/services/product-service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { IProductSummary } from '../../../seller feature/models/iproduct-summary';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, AddProduct],
  templateUrl: './my-products.html',
  styleUrl: './my-products.css',
})
export class MyProducts implements OnInit {
  private productService = inject(ProductService);
  private shopService = inject(ShopService);

  activeTab = signal<'list' | 'add'>('list');
  products = signal<IProductSummary[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  shopId = signal('');
  editingProductId = signal<string | null>(null);

  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: shop => {
        this.shopId.set(shop.id);
        this.loadProducts();
      },
      error: () => {
        this.error.set('Failed to load shop');
        this.isLoading.set(false);
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getMyProducts(this.shopId(), this.currentPage()).subscribe({
      next: res => {
        this.products.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'list' | 'add') {
    this.activeTab.set(tab);
    if (tab === 'list') {
      this.editingProductId.set(null);
      this.loadProducts();
    }
  }

  editProduct(id: string) {
    this.editingProductId.set(id);
    this.setTab('add');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadProducts();
    }
  }

  deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Failed to delete product')
    });
  }
}