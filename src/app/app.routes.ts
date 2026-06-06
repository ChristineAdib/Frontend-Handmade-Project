import { Routes } from '@angular/router';
import { AuthComponent } from './auth/components/auth.component/auth.component';
import { authGuard } from './auth/guards/authGard';
import { WishlistPageComponent } from './wishlist feature/components/wishlist-page/wishlist-page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'wishlist', component: WishlistPageComponent , canActivate: [authGuard] },

  // Orders & Cart
  { path: 'orders', loadComponent: () => import('./orders/components/order-list/order-list.component').then(c => c.OrderListComponent), canActivate: [authGuard] },
  { path: 'orders/:id', loadComponent: () => import('./orders/components/order-detail/order-detail.component').then(c => c.OrderDetailComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./orders/components/checkout/checkout.component').then(c => c.CheckoutComponent), canActivate: [authGuard] },
  { path: 'cart', loadComponent: () => import('./orders/components/cart-page/cart-page.component').then(c => c.CartPageComponent), canActivate: [authGuard] },
// { path: 'wishlist', loadComponent: () => import('./wishlist%20feature/components/wishlist-page/wishlist-page.component').then(c => c.WishlistPageComponent), canActivate: [authGuard] },

  // Payments (specific routes BEFORE parameterized ones)
  { path: 'payment/callback', loadComponent: () => import('./payments/components/payment-callback/payment-callback.component').then(c => c.PaymentCallbackComponent) },
  { path: 'payment/:orderId', loadComponent: () => import('./payments/components/payment-page/payment-page.component').then(c => c.PaymentPageComponent), canActivate: [authGuard] },
];
