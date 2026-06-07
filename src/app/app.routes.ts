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

  // Public shop page

  { path: 'shop/:id', loadComponent: () => import('./shop feature/components/shop-public/shop-public').then(c => c.ShopPublic) },

];


