import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ProductsService } from '../../services/products-service';
import { LanguageService } from '../../../core/services/language.service';
import { Product, ProductQuery } from '../../models/product.model';

import { SearchComponent } from '../search/search.component';
import { CategoryFilterComponent } from '../category-filter/category-filter.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchComponent,
    CategoryFilterComponent,
    ProductCardComponent,
    PaginationComponent
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit, OnChanges {
  private productsService = inject(ProductsService);
  public langService = inject(LanguageService);
  private route = inject(ActivatedRoute);

  @Input() parentSearch: string = '';

  // State managed via Signals
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('0');
  
  // Pagination Signals
  pageIndex = signal<number>(1);
  pageSize = signal<number>(8);
  totalCount = signal<number>(0);
  totalPages = signal<number>(1);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

  // Array of numbers for rendering skeletons
  skeletonArray = Array(8).fill(0);

  ngOnInit(): void {
    // Subscribe to query parameters to filter by category if provided
    this.route.queryParams.subscribe(params => {
      const categoryParam = params['category'];
      if (categoryParam) {
        // Fetch categories first to match by name
        this.productsService.getCategories().subscribe({
          next: (categories) => {
            const matchedCat = categories.find(
              c => c.nameEn.toLowerCase() === categoryParam.toLowerCase()
            );
            if (matchedCat) {
              this.selectedCategory.set(matchedCat.id);
            } else {
              this.selectedCategory.set('0');
            }
            this.pageIndex.set(1);
            this.loadProducts();
          },
          error: () => {
            this.selectedCategory.set('0');
            this.loadProducts();
          }
        });
      } else {
        if (!this.parentSearch) {
          this.loadProducts();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentSearch']) {
      const newVal = changes['parentSearch'].currentValue || '';
      this.searchTerm.set(newVal);
      this.pageIndex.set(1);
      this.loadProducts();
    }
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: ProductQuery = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      categoryId: this.selectedCategory() !== '0' ? this.selectedCategory() : undefined,
      search: this.searchTerm() || undefined
    };

    this.productsService.getProducts(query).subscribe({
      next: (res) => {
        this.products.set(res.items || []);
        this.totalCount.set(res.totalCount || 0);
        this.totalPages.set(res.totalPages || 1);
        this.hasNext.set(res.hasNext || false);
        this.hasPrevious.set(res.hasPrevious || false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed loading products:', err);
        this.error.set(this.langService.translate('failedToLoadProducts'));
        this.loading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(1);
    this.loadProducts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.pageIndex.set(1);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('0');
    this.pageIndex.set(1);
    this.loadProducts();
  }

  retry(): void {
    this.loadProducts();
  }

  onQuickView(product: Product): void {
    // Quick View placeholder or custom modal action can go here
    console.log('Quick View Product:', product);
  }
}
