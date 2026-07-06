import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ProductsService } from '../../services/products-service';
import { LanguageService } from '../../../core/services/language.service';
import { Product, ProductQuery } from '../../models/product.model';
import { ShopService } from '../../../shop feature/services/shop-service';

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
  private shopService = inject(ShopService);

  @Input() parentSearch: string = '';

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  categoryIds = signal<string[]>([]);   // ✅ بدل selectedCategory
  initialCategoryName = signal<string | null>(null); // ✅ يتبعت للـ filter component
  onlyOnePiece = signal<boolean>(false);

  pageIndex = signal<number>(1);
  pageSize = signal<number>(8);
  totalCount = signal<number>(0);
  totalPages = signal<number>(1);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

  totalActiveProducts = signal<number | null>(null);
  totalActiveShops = signal<number | null>(null);
  isFirstLoad = signal<boolean>(true);
  showBackToTop = signal<boolean>(false);

  skeletonArray = Array(8).fill(0);

  ngOnInit(): void {
    this.fetchMarketplaceStats();
    this.route.queryParams.subscribe(params => {
      const categoryParam = params['category'];
      const searchParam = params['search'];

      if (searchParam) {
        this.searchTerm.set(searchParam);
      }

      if (categoryParam) {
        // مش بنحمل المنتجات هنا فورًا — بننتظر الـ CategoryFilterComponent
        // يطبق الاختيار ويطلع categoryIdsChange، هو ده اللي هيستدعي loadProducts
        this.initialCategoryName.set(categoryParam);
      } else {
        this.initialCategoryName.set(null);
        this.loadProducts();
      }
    });
  }

  fetchMarketplaceStats(): void {
    this.productsService.getProducts({ pageIndex: 1, pageSize: 1 }).subscribe({
      next: (res) => {
        this.totalActiveProducts.set(res.totalCount || null);
      },
      error: () => {
        this.totalActiveProducts.set(null);
      }
    });

    this.shopService.searchShops({}).subscribe({
      next: (res) => {
        this.totalActiveShops.set(res.length || null);
      },
      error: () => {
        this.totalActiveShops.set(null);
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
      categoryIds: this.categoryIds().length > 0 ? this.categoryIds() : undefined,
      
      search: this.searchTerm() || undefined,
      onlyOnePiece: this.onlyOnePiece() ? true : undefined
    };

    this.productsService.getProducts(query).subscribe({
      next: (res) => {
        this.products.set(res.items || []);
        this.totalCount.set(res.totalCount || 0);
        this.totalPages.set(res.totalPages || 1);
        this.hasNext.set(res.hasNext || false);
        this.hasPrevious.set(res.hasPrevious || false);
        this.loading.set(false);
        if (this.isFirstLoad()) {
          setTimeout(() => {
            this.isFirstLoad.set(false);
          }, 1500);
        }
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

  // ✅ بيستقبل الـ ids الجاهزة من CategoryFilterComponent (أب+subs أو sub واحد أو [])
  onCategoryIdsChange(ids: string[]): void {
    this.categoryIds.set(ids);
    this.pageIndex.set(1);
    this.loadProducts();
  }

  toggleOnePieceFilter(): void {
    this.onlyOnePiece.update(val => !val);
    this.pageIndex.set(1);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryIds.set([]);
    this.onlyOnePiece.set(false);
    this.pageIndex.set(1);
    this.loadProducts();
  }

  retry(): void {
    this.loadProducts();
  }

  onQuickView(product: Product): void {
    console.log('Quick View Product:', product);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop.set(scrollPosition > 400);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}