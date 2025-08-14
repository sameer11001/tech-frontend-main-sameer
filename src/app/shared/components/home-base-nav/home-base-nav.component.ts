import { Component, HostListener } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-base-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './home-base-nav.component.html',
  styleUrls: ['./home-base-nav.component.css']
})
export class HomeBaseNavComponent {
  isMobileMenuOpen: boolean = false;
  isScrolled: boolean = false;
  
  constructor(private router: Router) {}
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  isActiveRoute(routePath: string): boolean {
    return this.router.url.includes(routePath);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollPosition > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('nav') && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}