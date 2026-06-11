import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/Services/auth';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../Chat/Services/chat.service';
import { LanguageService } from '../../core/services/language.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  protected chatService = inject(ChatService);
  protected langService = inject(LanguageService);

  ngOnInit(): void {
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

  isLoggedIn(): boolean{
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
}



