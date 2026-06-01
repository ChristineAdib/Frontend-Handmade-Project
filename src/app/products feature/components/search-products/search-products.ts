import { Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products-service';
import { ProductApiService } from '../../services/product-api-service';
import { IProductAPI } from '../../models/iproductAPI';
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
  private ProductsService = inject(ProductApiService)
  private toastr = inject(ToastrService);

  products: IProductAPI[] = [];
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

    this.ProductsService.searchProducts(title).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;

        if (data.length > 0) {
          this.toastr.success(`Found ${data.length} products!`, 'Search Complete');
        } else {
          this.toastr.warning('No products found!', 'Search Complete');
        }
      },

      error: (err) => {
        this.toastr.error('Something went wrong!', 'Error');
        this.isLoading = false;
      }
    });

  }
}
