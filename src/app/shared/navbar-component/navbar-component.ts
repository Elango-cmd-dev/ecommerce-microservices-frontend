import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar-component',
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss',
})
export class NavbarComponent{

   userName$!: Observable<string | null>;
  showAccountMenu = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.userName$ = this.authService.userName$;
  }

  toggleAccountMenu(event: MouseEvent) {
    event.stopPropagation(); // prevents auto-close
    this.showAccountMenu = !this.showAccountMenu;
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    this.showAccountMenu = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onGoToLogin(): void {
    this.router.navigate(['/login']);
  }
}