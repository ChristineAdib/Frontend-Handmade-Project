import { Component, OnInit, inject } from '@angular/core';
import { IProductAPI } from '../../models/iproductAPI';
import { ProductApiService } from '../../services/product-api-service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-product-api',
  imports: [CommonModule],
  templateUrl: './product-api.html',
  styleUrl: './product-api.css',
})
export class ProductApi implements OnInit{
  products: IProductAPI[] = [];
  isLoading = true;
  errorMessage = '';

  public langService = inject(LanguageService);
  private ProductApiService = inject(ProductApiService);
  
  ngOnInit(): void {
    this.ProductApiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }
}
