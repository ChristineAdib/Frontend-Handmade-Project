import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { ICategory } from '../../../models/icategory';
import { IProduct } from '../../../models/iproduct';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../../core/directives/product-card';
import { CurrencyPipe, TitleCasePipe, UpperCasePipe, NgStyle, NgClass} from '@angular/common';
// import { ProductDetail } from '../product-detail/product-detail';
import { AppHoverCard } from '../../../core/directives/app-hover-card';
import { Store } from '../../../models/store';
import { ProductsService } from '../../services/products-service';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCard, CurrencyPipe, TitleCasePipe, UpperCasePipe, NgStyle, NgClass, AppHoverCard, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})


export class Products implements OnChanges {


  //step#1 => inject the function
  private productService = inject(ProductsService);


  // ── @Input من الـ Parent ──
  @Input() parentSearch: string = '';


  //Just UI
  MyStore: Store = new Store(
    'Handoura', 
    ['Cairo', 'Alexandria', 'Aswan'], 
    'logo.jpg'
  );
  
  StoreOwner: string = "Steven Ayman";
  searchName: string = '';
  selectedCategoryID: number = 0;



  get categories() {
    return this.productService.categories;
  }

  get FilteredProducts(): IProduct[] {
    return this.productService.getFilteredProducts(
      this.searchName,
      this.selectedCategoryID
    );
  }




  // ngOnChanges بيشتغل لما الـ @Input يتغير 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentSearch']) {
      const newValue = changes['parentSearch'].currentValue;
      console.log('Search changed:', newValue);

      // بيحدث الـ searchName بقيمة الـ Parent
      this.searchName = newValue;
    }
  }


  //talk to service
  buy(product: IProduct): void{
    this.productService.buy(product);
  }

  getStockStatus(qty:number): string{
    return this.productService.getStockStatus(qty);
  }


  //UI Logic
  // component communication
  // selectedProduct: IProduct | null = null;
  // showDetail: boolean = false;

  // viewDetails(product: IProduct): void {
  //   this.selectedProduct = product;
  //   this.showDetail = true;
  // }

  // onCloseDetail(): void {
  //   this.showDetail = false;
  //   this.selectedProduct = null;
  // }

}

