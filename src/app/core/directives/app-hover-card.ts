import { Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appAppHoverCard]'
})
export class AppHoverCard {

  // @Input هيستقبل القيم من الـ HTML
  @Input() hoverScale: string = '1.05';
  @Input() hoverShadow: string = '0 8px 25px rgba(0,0,0,0.2)';

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    this.el.nativeElement.style.cursor = 'pointer';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.transform = `scale(${this.hoverScale})`;
    this.el.nativeElement.style.boxShadow = this.hoverShadow;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.transform = 'scale(1)';
    this.el.nativeElement.style.boxShadow = 'none';
  }

  
}

