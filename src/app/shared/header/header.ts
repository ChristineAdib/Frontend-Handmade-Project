import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/Services/auth';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../Chat/Services/chat.service';
import { LanguageService } from '../../core/services/language.service';
import { CategoryService } from '../../Categories/Services/category.service';
import { CategoryResponse } from '../../Categories/Models/CategoryResponse';
import { filter, Subscription } from 'rxjs';
import { Component, inject, signal, HostListener, computed, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CartApiService } from '../../orders/services/cart-api.service';
import { WishlistService } from '../../wishlist feature/services/wishlist-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NotificationService } from '../../Notifications/Services/notification.service';
import { parseUtcDate } from '../../core/utils/date-utils';
import { CustomStudioService } from '../../custom-studio/services/custom-studio.service';
import { ProductsService } from '../../products feature/services/products-service';
 
// Static fallback — shown when backend is down or returns empty list
const FALLBACK_CATEGORIES: CategoryResponse[] = [
  { id: 'f1', nameEn: 'Pottery',  nameAr: 'فخار',   imageUrl: null, parentId: null, subCategories: [] },
  { id: 'f2', nameEn: 'Beads',    nameAr: 'خرز',     imageUrl: null, parentId: null, subCategories: [] },
  { id: 'f3', nameEn: 'Crochet',  nameAr: 'كروشيه', imageUrl: null, parentId: null, subCategories: [] },
];
 
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private authService    = inject(AuthService);
  private router         = inject(Router);
  private toastr         = inject(ToastrService);
  protected chatService  = inject(ChatService);
  protected langService  = inject(LanguageService);
  private cartService    = inject(CartApiService);
  protected wishlistService = inject(WishlistService);
  private categoryService   = inject(CategoryService);
  private sanitizer         = inject(DomSanitizer);
  protected notificationService = inject(NotificationService);
  private customStudioService = inject(CustomStudioService);
  private productService    = inject(ProductsService);
  private notifSub?: Subscription;
  private ngZone         = inject(NgZone);
 
  // ── Scroll state management ────────────────────────────────
  public scrollState = signal<string>('top');
  public isScrolled = signal<boolean>(false);
  private scrollCleanUpFn?: () => void;
 
  // ── Local signal for displayed categories ──────────────────
  displayedCategories = signal<CategoryResponse[]>([]);
  categoriesLoading   = signal<boolean>(false);
 
  // ── Creative side panel (next to logo) ──────────────────────
  creativePanelOpen = signal(false);
  creativeProducts = signal<any[]>([]);
  creativeProductsLoading = signal(false);
 
  // ── Icons per category (lowercase English name key) ────────
  private categoryIcons: Record<string, string> = {
    pottery: `<path d="M7 8C7 5 9 3 12 3C15 3 17 5 17 8"/><path d="M7 8C7 12 8 15 9 17C10 19 14 19 15 17C16 15 17 12 17 8"/><path d="M9 17H15"/><path d="M8 20H16"/><path d="M9 20V17"/><path d="M15 20V17"/>`,
    beads:   `<path d="M4 10C4 10 6 4 12 4C18 4 20 10 20 10"/><circle cx="12" cy="14" r="2"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><path d="M12 16V20"/>`,
    crochet: `<path d="M12 2V14"/><path d="M8 6C8 6 10 4 12 4C14 4 16 6 16 6"/><path d="M8 10C8 10 10 8 12 8C14 8 16 10 16 10"/><path d="M8 14C8 14 10 12 12 12C14 12 16 14 16 14"/><path d="M10 18H14"/><path d="M11 18V22"/><path d="M13 18V22"/>`,
  };
  private defaultIcon = `<circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/>`;
 
  private categoryColors: Record<string, string> = {
    pottery: '#8B6914',
    beads:   '#c8813a',
    crochet: '#A0522D',
  };
 
  getCategoryIcon(nameEn: string): string {
    return this.categoryIcons[nameEn.toLowerCase()] ?? this.defaultIcon;
  }
 
  getFullCategoryIconSvg(nameEn: string): SafeHtml {
    const paths = this.getCategoryIcon(nameEn);
    const color = this.getCategoryColor(nameEn);
    const svg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
  getCategoryColor(nameEn: string): string {
    return this.categoryColors[nameEn.toLowerCase()] ?? '#c8813a';
  }
 
  // Navigate to /products?category=pottery  then close dropdown
  goToCategory(nameEn: string): void {
    this.router.navigate(['/products'], { queryParams: { category: nameEn.toLowerCase() } });
    this.activeDropdown.set(null);
  }
 
  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.cartService.getCart();
    this.wishlistService.getWishList().subscribe();
    this.loadCategories();
    this.setupScrollListener();
 
    if (this.isLoggedIn()) {
      this.chatService.initializeRealTime();
      this.chatService.loadConversations();
      const token = this.authService.getToken();
      if (token) {
        this.notificationService.startConnection(token);
        this.notificationService.loadUnreadCount();
        this.notificationService.loadNotifications(1, 10);
      }
      this.setupNotificationListener();
    }
 
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isLoggedIn()) {
        this.chatService.initializeRealTime();
        this.chatService.loadConversations();
        const token = this.authService.getToken();
        if (token) {
          this.notificationService.startConnection(token);
          this.notificationService.loadUnreadCount();
          this.notificationService.loadNotifications(1, 10);
        }
        this.setupNotificationListener();
      } else {
        this.chatService.disconnectRealTime();
        this.notificationService.stopConnection();
        if (this.notifSub) {
          this.notifSub.unsubscribe();
          this.notifSub = undefined;
        }
      }
    });
  }
 
  ngOnDestroy(): void {
    if (this.scrollCleanUpFn) {
      this.scrollCleanUpFn();
    }
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }
 
  private setupScrollListener(): void {
    let lastScrollY = window.scrollY;
    
    this.ngZone.runOutsideAngular(() => {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const diff = scrollY - lastScrollY;
        
        let newState = this.scrollState();
        let newScrolled = this.isScrolled();
 
        if (scrollY <= 0) {
          newState = 'top';
          newScrolled = false;
        } else if (scrollY < 50) {
          newState = 'scrolled-up';
          newScrolled = true;
        } else {
          newScrolled = true;
          if (Math.abs(diff) > 5) {
            if (diff > 0) {
              newState = 'scrolled-down';
            } else {
              newState = 'scrolled-up';
            }
          }
        }
 
        lastScrollY = scrollY;
 
        if (newState !== this.scrollState() || newScrolled !== this.isScrolled()) {
          this.ngZone.run(() => {
            this.scrollState.set(newState);
            this.isScrolled.set(newScrolled);
          });
        }
      };
 
      window.addEventListener('scroll', handleScroll, { passive: true });
      this.scrollCleanUpFn = () => {
        window.removeEventListener('scroll', handleScroll);
      };
    });
  }
 
  private setupNotificationListener(): void {
    if (this.notifSub) return;
    this.notifSub = this.notificationService.notificationReceived$.subscribe({
      next: (notif) => {
        if (notif.referenceType === 'CustomRequest' && 
            (notif.type === 16 || notif.type === 19 || notif.titleEn?.includes('Paid') || notif.titleEn?.includes('Deposit'))) {
          const currentUrl = this.router.url;
          if (currentUrl.includes('/chat/')) {
            this.router.navigate(['/custom-studio/workspace', notif.referenceId]);
            this.toastr.success(this.langService.currentLang() === 'ar' 
              ? 'تم دفع العربون! جاري فتح مساحة عمل الكروشيه...' 
              : 'Deposit paid! Opening crochet workspace...');
          } else {
            this.toastr.info(
              this.langService.currentLang() === 'ar'
                ? 'تم دفع عربون طلب الكروشيه المخصص. اضغط هنا لفتح مساحة العمل.'
                : 'Deposit paid for custom crochet request. Click to open workspace.',
              this.langService.currentLang() === 'ar' ? 'طلب مخصص جديد' : 'New Custom Request',
              { timeOut: 8000 }
            ).onTap.subscribe(() => {
              this.router.navigate(['/custom-studio/workspace', notif.referenceId]);
            });
          }
        }
      }
    });
  }
 
  private async loadCategories(): Promise<void> {
    this.categoriesLoading.set(true);
    try {
      await this.categoryService.loadAll();
      const fromApi = this.categoryService.categories();
      // Use API data if returned, otherwise show fallback
      this.displayedCategories.set(fromApi.length > 0 ? fromApi : FALLBACK_CATEGORIES);
    } catch {
      this.displayedCategories.set(FALLBACK_CATEGORIES);
    } finally {
      this.categoriesLoading.set(false);
    }
  }
 
  // ── Creative side panel logic ───────────────────────────────
  toggleCreativePanel(): void {
    this.creativePanelOpen.update(v => !v);
    document.body.style.overflow = this.creativePanelOpen() ? 'hidden' : '';
    if (this.creativePanelOpen() && this.creativeProducts().length === 0) {
      this.loadCreativeProducts();
    }
  }
 
  private loadCreativeProducts(): void {
    this.creativeProductsLoading.set(true);
    this.productService.getProducts(1, 8).subscribe({
      next: (res: any) => {
        this.creativeProducts.set(res.items);
        this.creativeProductsLoading.set(false);
      },
      error: () => {
        this.creativeProductsLoading.set(false);
      }
    });
  }
 
  // ── Computed shortcuts ─────────────────────────────────────
  cartCount     = computed(() => this.cartService.cart()?.totalItems ?? 0);
  wishlistCount = computed(() => this.wishlistService.wishlist()?.totalItems ?? 0);
 
  // ── UI state ───────────────────────────────────────────────
  mobileMenuOpen = signal(false);
  searchOpen     = signal(false);
  searchQuery    = signal('');
  activeDropdown = signal<string | null>(null);
 
  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
    document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
  }
  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.searchOpen()) setTimeout(() => document.getElementById('navSearch')?.focus(), 100);
  }
  toggleDropdown(name: string) {
    this.activeDropdown.update(v => v === name ? null : name);
  }
  openDropdown(name: string) {
    this.activeDropdown.set(name);
  }
  closeDropdown() {
    this.activeDropdown.set(null);
  }
  onSearch() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery() } });
      this.searchOpen.set(false);
      this.searchQuery.set('');
    }
  }
 
  // ── Auth helpers ───────────────────────────────────────────
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }
  isSeller(): boolean {
    return this.authService.getUser()?.roles?.includes('Seller') ?? false;
  }
  logout() {
    this.chatService.disconnectRealTime();
    this.notificationService.stopConnection();
    this.authService.logout();
    this.toastr.info('See you soon!', 'Logged Out');
    this.router.navigate(['/login-api']);
  }
  getUserName(): string { return this.authService.getUser()?.name ?? ''; }
  getUserProfileImage(): string | null {
    const user = this.authService.getUser();
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith('http://') || user.profileImage.startsWith('https://'))
      return user.profileImage;
    return `${environment.apiUrl}/${user.profileImage}`;
  }
 
  handleNotificationClick(notif: any): void {
    this.notificationService.markAsRead(notif.id);
    this.activeDropdown.set(null);
 
    if (notif.referenceType === 'CustomRequest' && notif.referenceId) {
      this.customStudioService.getCustomRequestDetails(notif.referenceId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const status = res.data.status;
            const isBuyer = !this.isSeller();
            const isPaidOrHigher = ['Paid', 'InProgress', 'Completed', 'Shipped'].includes(status);
            const isReviewState = ['OfferSent', 'OfferAccepted', 'PaymentPending'].includes(status);
            
            if (isPaidOrHigher) {
              this.router.navigate([`/custom-studio/workspace/${notif.referenceId}`]);
            } else if (isReviewState && isBuyer) {
              this.router.navigate([`/custom-studio/offer-review/${notif.referenceId}`]);
            } else {
              this.router.navigate([`/custom-studio/negotiation/${notif.referenceId}`]);
            }
          } else {
            this.router.navigate(['/custom-studio']);
          }
        },
        error: () => {
          this.router.navigate(['/custom-studio']);
        }
      });
      return;
    }
 
    const type = Number(notif.type);
    
    if (type === 7) { // Message
      if (notif.referenceId) {
        this.router.navigate([`/chat/${notif.referenceId}`]);
      } else {
        this.router.navigate(['/chat']);
      }
    } else if (type === 8 || type === 6) { // Follow / NewFollower
      if (this.isSeller()) {
        this.router.navigate(['/seller/followers']);
      } else {
        this.router.navigate(['/']);
      }
    } else if (type === 1 || type === 16 || type === 19) { // Order / NewOrder / OrderStatusChanged
      if (notif.referenceId) {
        if (this.isSeller() && (type === 16 || type === 19)) {
          this.router.navigate([`/seller/orders`]);
        } else {
          this.router.navigate([`/orders/${notif.referenceId}`]);
        }
      } else {
        if (this.isSeller()) {
          this.router.navigate(['/seller/orders']);
        } else {
          this.router.navigate(['/orders']);
        }
      }
    } else if (type === 2 || type === 17) { // Payment / PaymentReceived
      if (this.isSeller()) {
        this.router.navigate(['/seller/earnings']);
      } else {
        this.router.navigate(['/']);
      }
    } else if (type === 3) { // Review
      if (notif.referenceId) {
        this.router.navigate([`/products/${notif.referenceId}`]);
      } else {
        this.router.navigate(['/products']);
      }
    } else if (type === 9 || type === 10 || type === 11 || type === 12 || type === 13 || type === 14 || type === 15) { // Product
      if (type === 15 || type === 10) {
        if (notif.referenceId) {
          this.router.navigate([`/products/${notif.referenceId}`]);
        } else {
          this.router.navigate(['/products']);
        }
      } else {
        if (this.isSeller()) {
          this.router.navigate(['/seller/products']);
        } else {
          this.router.navigate(['/products']);
        }
      }
    } else if (type === 18) { // UserBanned
      this.logout();
    } else {
      this.router.navigate(['/']);
    }
  }
 
  getRelativeTime(createdAt: string): string {
    const created = parseUtcDate(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
 
    const isAr = this.langService.currentLang() === 'ar';
 
    if (diffMins < 1) {
      return isAr ? 'الآن' : 'Just now';
    }
    if (diffMins < 60) {
      return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  }
 
  onSellerIconClick() { this.toastr.info('Start Selling on Handaura', ''); }
}
 