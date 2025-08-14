import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeBaseNavComponent } from '../../shared/components/home-base-nav/home-base-nav.component';
import * as ProfileSettings from '../../core/services/profile-settings/ngrx/profile-settings.actions';

@Component({
  selector: 'app-dashboard-base',
  standalone: true,
  imports: [HomeBaseNavComponent, RouterOutlet,],
  templateUrl: './home-base.component.html',
  styleUrl: './home-base.component.css'
})
export class HomeBaseComponent {
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProfileSettings.getBusinessProfile());
  }
}
