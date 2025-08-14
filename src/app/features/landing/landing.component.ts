import { Component, OnInit } from '@angular/core';
import { HeroComponent } from "./components/hero/hero.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { PricingComponent } from "./components/pricing/pricing.component";
import { FeaturesComponent } from "./components/features/features.component";
import { ReviewsComponent } from "./components/reviews/reviews.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [CommonModule, HeroComponent, NavbarComponent, PricingComponent, FeaturesComponent, ReviewsComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class MainComponent implements OnInit {
  isDarkMode = false;

  ngOnInit() {
    // Check for saved theme preference or default to light mode
    this.initializeTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    console.log('Dark mode toggled:', this.isDarkMode); // Debug log
    this.applyTheme();
    // Save preference to localStorage
    localStorage.setItem('landing-theme', this.isDarkMode ? 'dark' : 'light');
  }

  private initializeTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('landing-theme');
    
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
    }
    
    console.log('Initial theme:', this.isDarkMode ? 'dark' : 'light'); // Debug log
    this.applyTheme();
  }

  private applyTheme() {
    const htmlElement = document.documentElement;
    
    if (this.isDarkMode) {
      htmlElement.classList.add('dark');
      console.log('Dark class added'); // Debug log
    } else {
      htmlElement.classList.remove('dark');
      console.log('Dark class removed'); // Debug log
    }
  }
}
