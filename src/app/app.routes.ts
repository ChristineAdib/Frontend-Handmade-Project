import { Routes } from '@angular/router';
import { AuthComponent } from './auth/components/auth.component/auth.component';


export const routes: Routes = [
{
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
},
  { path: 'login',    component: AuthComponent },
{ path: 'register', component: AuthComponent },
];
