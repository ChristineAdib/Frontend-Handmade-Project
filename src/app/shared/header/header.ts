import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../auth/Services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  private authService = inject(Auth);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }
  logout(){
    this.authService.logout();
    this.toastr.info('See you soon!', "Logged Out")
    this.router.navigate(['/login-api']);
  }
}



