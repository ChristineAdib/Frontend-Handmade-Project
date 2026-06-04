import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/product-api-service';
import { IPagedResult, IProductSummaryDto } from '../../models/iproductAPI';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-products.html',
  styleUrl: './search-products.css',
})
export class SearchProducts {
  private ProductsService = inject(ProductService);
  private toastr = inject(ToastrService);

  products: IProductSummaryDto[] = [];
  isLoading = false;
  errorMessage = '';
  hasSearched = false;

  searchForm = new FormGroup({
    title: new FormControl(''),
  });

  search(): void{
    const title = this.searchForm.getRawValue().title ?? '';
    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.products = [];

    this.ProductsService.getProducts({ search: title }).subscribe({
      next: (data: IPagedResult<IProductSummaryDto>) => {
        this.products = data.items;
        this.isLoading = false;

        if (data.items.length > 0) {
          this.toastr.success(`Found ${data.items.length} products!`, 'Search Complete');
        } else {
          this.toastr.warning('No products found!', 'Search Complete');
        }
      },

      error: (err: Error) => {
        this.toastr.error('Something went wrong!', 'Error');
        this.isLoading = false;
      }
    });

  }
}
