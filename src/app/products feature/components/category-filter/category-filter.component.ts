import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products-service';
import { Category } from '../../models/product.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss'
})
export class CategoryFilterComponent implements OnInit {
  private productService = inject(ProductsService);
  public langService = inject(LanguageService);

  @Input() selectedCategoryId: string = '0';
  @Output() categoryChange = new EventEmitter<string>();

  categories: Category[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectCategory(id: string): void {
    this.selectedCategoryId = id;
    this.categoryChange.emit(id);
  }

  onDropdownChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectCategory(select.value);
  }
}
