import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-navbar-cli',
  imports: [RouterLink],
  templateUrl: './navbar-cli.html',
  styleUrl: './navbar-cli.css'
})
export class NavbarCli {
isHeaderScrolled = false;
  currentSlide = 0;
  isMobileMenuActive = false;
  isBackToTopVisible = false;
  activeHeroSlide = 0;
  activeProjectIndex = 0;
  
    @HostListener('window:scroll')
    onWindowScroll(): void {
      this.isHeaderScrolled = window.scrollY > 50;
      this.isBackToTopVisible = window.scrollY > 300;
    }
  
    private setupScrollListener(): void {
      this.isHeaderScrolled = window.scrollY > 50;
    }
  
    // Métodos para las nuevas funcionalidades
    toggleMobileMenu(): void {
      this.isMobileMenuActive = !this.isMobileMenuActive;
    }
  
    closeMobileMenu(): void {
      this.isMobileMenuActive = false;
    }
  
    scrollToTop(): void {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  
}
