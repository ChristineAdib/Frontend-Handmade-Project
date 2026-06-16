import { Component, signal,HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Products } from './products feature/components/products/products';
// import { ProductDetail } from "./products feature/components/product-detail/product-detail";
// import { Profile } from './user feature/components/profile/profile';
// import { Login } from './auth/components/login/login/login';
import { Header } from "./shared/header/header";
// import { Footer } from "./shared/footer/footer";
// import { Home } from "./navbar feature/components/home/home";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('handmade');
  cursorX =0;
  cursorY =0;
@HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
this.cursorX =event.clientX;
this.cursorY =event.clientY;
  }
}


