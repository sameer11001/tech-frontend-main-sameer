import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class AutomationsComponent {
  constructor(private router: Router) {}

  onLogout(): void {
    // Implement logout logic here
    console.log('Logout clicked');
  }
} 