import { Routes } from '@angular/router';
import { Home } from './navbar feature/components/home/home';
import { Component } from '@angular/core';
import { About } from './navbar feature/components/about/about';
import { Contact } from './navbar feature/components/contact/contact';
import { Profile } from './user feature/components/profile/profile';
import { Products } from './products feature/components/products/products';
import { ProductDetail } from './products feature/components/product-detail/product-detail';
import { NotFound } from './navbar feature/components/not-found/not-found';
import { Register } from './auth/components/register/register/register';
import { Login } from './auth/components/login/login/login';
import { ProductApi } from './products feature/components/product-api/product-api';
import { LoginWithApi } from './auth/components/login-with-api/login-with-api';
import { guestGuard } from './auth/guards/guest-guard';
import { SearchProducts } from './products feature/components/search-products/search-products';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
},
{
    path: 'home',
    component: Home
},
{
    path: 'about',
    component: About
},
{
    path: 'contact',
    component: Contact
},
{
    path: 'profile',
    component: Profile
},
{
    path: 'products',
    component: Products
},
{
    path: 'products/:id',
    component: ProductDetail
},
{
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
},
{
    path: 'login',
    component: Login
},
{
    path: 'login-api',
    component: LoginWithApi,
    canActivate: [guestGuard]
},
{
  path: 'products-api',
  component: ProductApi,


},
{
  path: 'search-products',
  component: SearchProducts
},
{
    path: '**',
    component: NotFound
}

    
];
