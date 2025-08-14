import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  constructor(private router: Router) { }

  goToLogin() {
    this.router.navigate(['/auth/sign-in']);
  }
}
