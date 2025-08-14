import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast-message/toast-message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ErroreToastService } from '../../utils/toast.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    MatDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  constructor(private errore: ErroreToastService) {
  }


}

