import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    @Input() isDarkMode = false;
    @Output() toggleDarkMode = new EventEmitter<void>();

    constructor(private router: Router) { }

    goToLogin() {
        this.router.navigate(['/auth/sign-in']);
    }

    onToggleDarkMode() {
        console.log('Navbar: Toggle dark mode clicked'); // Debug log
        this.toggleDarkMode.emit();
    }
}
