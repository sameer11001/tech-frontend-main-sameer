import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './broadcast.component.html',
  styleUrl: './broadcast.component.css'
})
export class BroadcastComponent {

}
