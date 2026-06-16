import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/Services/auth';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../Chat/Services/chat.service';
import { LanguageService } from '../../core/services/language.service';
import { filter } from 'rxjs';
import { Component, inject, signal, HostListener, computed,OnInit } from '@angular/core';
import { CartApiService } from '../../orders/services/cart-api.service';
import { WishlistService } from '../../wishlist feature/services/wishlist-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  protected chatService = inject(ChatService);
  protected langService = inject(LanguageService);
  private cartService = inject(CartApiService);
  protected wishlistService = inject(WishlistService);

  ngOnInit(): void {
    // Load initial cart and wishlist state
    this.cartService.getCart();
    this.wishlistService.getWishList().subscribe();

    // 1. Initial connection if already logged in on load
    if (this.isLoggedIn()) {
      this.chatService.initializeRealTime();
      this.chatService.loadConversations();
    }

    // 2. Listen to navigation events to initialize/disconnect on state change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isLoggedIn()) {
        this.chatService.initializeRealTime();
        this.chatService.loadConversations();
      } else {
        this.chatService.disconnectRealTime();
      }
    });
  }

  onSellerIconClick() {
    this.toastr.info('Start Selling on Handaura', '');
  }

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = signal('');
  activeDropdown = signal<string | null>(null);

  cartCount = computed(() => this.cartService.cart()?.totalItems ?? 0);
  wishlistCount = computed(() => this.wishlistService.wishlist()?.totalItems ?? 0);

  categories = [
    { 
      name: 'Beads', 
      nameAr: 'خرز', 
      route: '/products', 
      color: '#c8813a'
    },
    { 
      name: 'Pottery', 
      nameAr: 'فخار', 
      route: '/products', 
      color: '#8B6914'
    },
    { 
      name: 'Crochet', 
      nameAr: 'كروشيه', 
      route: '/products', 
      color: '#A0522D'
    },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 30);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  isSeller(): boolean {
    const user = this.authService.getUser();
    return user?.roles?.includes('Seller') ?? false;
  }
  logout(){
    this.chatService.disconnectRealTime();
    this.authService.logout();
    this.toastr.info('See you soon!', "Logged Out")
    this.router.navigate(['/login-api']);
  }

  getUserName(): string {
    return this.authService.getUser()?.name ?? '';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
    if (this.mobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.searchOpen()) {
      setTimeout(() => document.getElementById('navSearch')?.focus(), 100);
    }
  }

  toggleDropdown(name: string) {
    this.activeDropdown.update(v => v === name ? null : name);
  }

  onSearch() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery() } });
      this.searchOpen.set(false);
      this.searchQuery.set('');
    }
  }

  // logout() {
  //   this.authService.logout();
  //   this.toastr.info('See you soon!', 'Logged Out');
  //   this.router.navigate(['/login']);
  // }
}