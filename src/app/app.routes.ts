import { Routes } from '@angular/router';
import { AuthComponent } from './auth/components/auth.component/auth.component';
import { SellerDashboard } from './seller feature/components/seller-dashboard/seller-dashboard';
import { Overview } from './seller feature/components/overview/overview';
import { MyProducts } from './seller feature/components/my-products/my-products';
import { AddProduct } from './seller feature/components/add-product/add-product';
import { Orders } from './seller feature/components/orders/orders';
import { Followers } from './seller feature/components/followers/followers';
import { Earnings } from './seller feature/components/earnings/earnings';
import { CustomRequests } from './seller feature/components/custom-requests/custom-requests';
import { Settings } from './seller feature/components/settings/settings';
import { MyProfile } from './seller feature/components/my-profile/my-profile';
import { authGuard } from './auth/guards/authGard';
import { roleGuard } from './auth/guards/roleGard';
import { WishlistPageComponent } from './wishlist feature/components/wishlist-page/wishlist-page';
import { Header } from './shared/header/header';

// Navbar Feature Components
import { Home } from './navbar feature/components/home/home';
import { About } from './navbar feature/components/about/about';
import { Contact } from './navbar feature/components/contact/contact';
import { NotFound } from './navbar feature/components/not-found/not-found';

// Products Feature Components
import { Products } from './products feature/components/products/products';
import { ProductDetail } from './products feature/components/product-detail/product-detail';
import { ProductApi } from './products feature/components/product-api/product-api';
import { SearchProducts } from './products feature/components/search-products/search-products';

export const routes: Routes = [
  { path: 'header', component: Header },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Navbar / General pages
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },

  // Auth
  { path: 'login', component: AuthComponent },
  { path: 'login-api', component: AuthComponent }, // Navbar login link fallback
  { path: 'register', component: AuthComponent },
  
  // Role-based profile redirect
  {
    path: 'profile',
    redirectTo: () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user.roles?.includes('Seller')) {
            return '/seller/overview';
          }
        } catch (e) {
          console.error('Error parsing user role for profile redirect', e);
        }
      }
      return '/dashboard';
    }
  },

  { path: 'wishlist', component: WishlistPageComponent , canActivate: [authGuard] },
  { path: 'dashboard', loadComponent: () => import('./user feature/components/dashboard/dashboard.component').then(c => c.DashboardComponent), canActivate: [authGuard, roleGuard], data: { roles: ['Buyer'] } },
  { path: 'profile/edit', loadComponent: () => import('./user feature/components/edit-profile/edit-profile.component').then(c => c.EditProfileComponent), canActivate: [authGuard, roleGuard], data: { roles: ['Buyer'] } },

  // Products
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'products-api', component: ProductApi },
  { path: 'search-products', component: SearchProducts },

  // Orders & Cart
  { path: 'orders', loadComponent: () => import('./orders/components/order-list/order-list.component').then(c => c.OrderListComponent), canActivate: [authGuard] },
  { path: 'orders/:id', loadComponent: () => import('./orders/components/order-detail/order-detail.component').then(c => c.OrderDetailComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./orders/components/checkout/checkout.component').then(c => c.CheckoutComponent), canActivate: [authGuard] },
  { path: 'cart', loadComponent: () => import('./orders/components/cart-page/cart-page.component').then(c => c.CartPageComponent), canActivate: [authGuard] },

  // Payments (specific routes BEFORE parameterized ones)
  { path: 'payment/callback', loadComponent: () => import('./payments/components/payment-callback/payment-callback.component').then(c => c.PaymentCallbackComponent) },
  { path: 'payment/:orderId', loadComponent: () => import('./payments/components/payment-page/payment-page.component').then(c => c.PaymentPageComponent), canActivate: [authGuard] },

  // Chat
  { path: 'chat', loadComponent: () => import('./Chat/components/chat.component').then(c => c.ChatComponent), canActivate: [authGuard] },
  
  // Seller Dashboard with nested routes
  {
    path: 'seller',
    component: SellerDashboard,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: Overview },
      { path: 'products', component: MyProducts },
      { path: 'products/edit/:id', component: AddProduct },
      { path: 'orders', component: Orders },
      { path: 'followers', component: Followers },
      { path: 'earnings', component: Earnings },
      { path: 'custom-requests', component: CustomRequests },
      { path: 'settings', component: Settings },
      { path: 'profile', component: MyProfile },
    ]
  },

  // Specific shop sub-routes BEFORE parameterized shop/:id
  {
    path: 'shop/orders',
    redirectTo: () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user.roles?.includes('Seller')) {
            return '/seller/orders';
          }
        } catch (e) {
          console.error('Error parsing user role for shop orders redirect', e);
        }
      }
      return '/orders';
    }
  },

  // Public shop page
  { path: 'shop/:id', loadComponent: () => import('./shop feature/components/shop-public/shop-public').then(c => c.ShopPublic) },

  // Wildcard fallback
  { path: '**', component: NotFound }
];


