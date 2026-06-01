import { Directive , ElementRef} from '@angular/core';

@Directive({
  selector: '[productCard]'
})

export class ProductCard {

  constructor(el: ElementRef) {
    el.nativeElement.style.borderRadius = '16px';
    el.nativeElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    el.nativeElement.style.overflow = 'hidden';
    el.nativeElement.style.border = '1px solid #e0e0e0';
    el.nativeElement.style.transition = 'box-shadow 0.3s ease';
  }
}






