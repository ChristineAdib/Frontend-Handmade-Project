import { Component, inject, OnInit } from '@angular/core';
import { IPagedResult, IProductSummaryDto } from '../../models/iproductAPI';
import { ProductService } from '../../services/product-api-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-api',
  imports: [CommonModule],
  templateUrl: './product-api.html',
  styleUrl: './product-api.css',
})
export class ProductApi implements OnInit {
  private productService = inject(ProductService);

  products: IProductSummaryDto[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data: IPagedResult<IProductSummaryDto>) => {
        this.products = data.items;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }
}
