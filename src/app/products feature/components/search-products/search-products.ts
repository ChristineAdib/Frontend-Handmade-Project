import { Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products-service';
import { ProductApiService } from '../../services/product-api-service';
import { IProductAPI } from '../../models/iproductAPI';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-search-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-products.html',
  styleUrl: './search-products.css',
})
export class SearchProducts {
  private ProductsService = inject(ProductApiService)
  private toastr = inject(ToastrService);
  public langService = inject(LanguageService);

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
          const successMsg = this.langService.currentLang() === 'ar' ? `تم العثور على ${data.length} منتج!` : `Found ${data.length} products!`;
          const successTitle = this.langService.currentLang() === 'ar' ? 'اكتمل البحث' : 'Search Complete';
          this.toastr.success(successMsg, successTitle);
        } else {
          const warnTitle = this.langService.currentLang() === 'ar' ? 'اكتمل البحث' : 'Search Complete';
          this.toastr.warning(this.langService.translate('noProductsFound'), warnTitle);
        }
      },

      error: (err) => {
        const errorTitle = this.langService.currentLang() === 'ar' ? 'خطأ' : 'Error';
        this.toastr.error(this.langService.translate('somethingWentWrongTryAgain'), errorTitle);
        this.isLoading = false;
      }
    });

  }
}
