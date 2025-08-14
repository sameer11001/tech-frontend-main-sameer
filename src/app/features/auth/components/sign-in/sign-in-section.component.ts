import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';
import * as AuthSelectors from '../../../../core/services/auth/ngrx/auth.selector';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';
import { login } from '../../../../core/services/auth/ngrx/auth.action';
import { SignInFormService } from './signin-form.service';
import { FormValidationUtils } from '../../../../utils/form-validation.utils';



@Component({
  selector: 'app-sign-in-section',
  standalone: true,
  imports: [
    LoadingButtonComponent,
    ReactiveFormsModule,
    CommonModule,
    NgIf,
  ],
  templateUrl: './sign-in-section.component.html',
  styleUrl: './sign-in-section.component.css'
})
export class SignInSectionComponent implements OnInit {
  loginForm!: FormGroup;
  client_id?: string;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  response$: Observable<string | null>;
  formValidator = FormValidationUtils;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private signinValidator: SignInFormService
  ) {
    this.loading$ = this.store.select(AuthSelectors.selectAuthLoading).pipe(
      map(loading => loading ?? false)
    );
    this.response$ = this.store.select(AuthSelectors.selectAuthResponse);
    this.error$ = this.store.select(AuthSelectors.selectAuthError);

  }

  ngOnInit(): void {
    this.loginForm = this.signinValidator.createForm();
    this.client_id = this.route.snapshot.paramMap.get('clientId') || '';
    if (this.client_id) {
      this.loginForm.patchValue({ client_id: this.client_id });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, client_id } = this.loginForm.value;
      this.store.dispatch(login({ email, password, client_id }));
    }
  }
}
