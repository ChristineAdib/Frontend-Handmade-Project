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

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  {
    path: 'seller',
    component: SellerDashboard,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: Overview },
      { path: 'products', component: MyProducts },
      { path: 'products/add', component: AddProduct },
      { path: 'products/edit/:id', component: AddProduct },
      { path: 'orders', component: Orders },
      { path: 'followers', component: Followers },
      { path: 'earnings', component: Earnings },
      { path: 'custom-requests', component: CustomRequests },
      { path: 'settings', component: Settings },
      { path: 'profile', component: MyProfile },
    ]
  }
];


