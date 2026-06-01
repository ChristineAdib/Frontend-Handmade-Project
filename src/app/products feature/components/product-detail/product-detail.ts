import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ProductsService } from '../../services/products-service';
import { IProduct } from '../../../models/iproduct';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe, UpperCasePipe, RouterLink],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {

  product: IProduct | null = null;

  // ── inject الـ ActivatedRoute عشان نقرأ الـ id من الـ URL ──
  private route = inject(ActivatedRoute);

  // ── inject الـ Service عشان نجيب المنتج ──
  private productService = inject(ProductsService);

  ngOnInit(): void {
    // اقرأ الـ id من الـ URL
    const id = this.route.snapshot.paramMap.get('id');

    // جيب المنتج من الـ Service
    if (id) {
      this.product = this.productService.getProductById(+id);
    }
  }

}






  // constructor(private productService: ProductsService){}

  // //receive product from (parent) component 
  // @Input() product! : IProduct; 

  // //send event to (parent) component to close the detail view
  // @Output() closeDetail = new EventEmitter<void>();

  // onClose(): void{
  //   this.closeDetail.emit();
  // }

  // getProductById(id:number): IProduct | null{
  //   return this.productService.getProductById(id);
  // }

// }
