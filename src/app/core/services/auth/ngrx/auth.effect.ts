import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import {
  AuthResponse,
  AuthError,
  AuthErrorType,
} from '../../../../core/models/auth.types';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserService } from '../../../../core/services/auth/user.service';
import * as AuthActions from './auth.action';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private store: Store
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap((credentials) =>
        this.authService.login(credentials).pipe(
          map((response: AuthResponse) => {
            if (response.success && response.status_code === 200) {
              return AuthActions.loginSuccess({
                token: response.data.access_token,
              });
            } else {
              return AuthActions.loginFailure({
                error: new AuthError(
                  AuthErrorType.INVALID_CREDENTIALS,
                  'Invalid credentials'
                ),
              });
            }
          }),
          catchError((error: AuthError) =>
            of(AuthActions.loginFailure({ error }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/dashboard/team-inbox']);
          // Load user data and set it in store after successful login
          this.userService.loadAndSetUser();
        })
      ),
    { dispatch: false }
  );

  refreshToken$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.refreshToken),
    switchMap(() =>
      this.authService.refreshToken().pipe(
        map((response: AuthResponse) => {
          const token = response.data.access_token;
          document.cookie = `session=${token}; path=/; Secure; SameSite=None`;
          return AuthActions.refreshTokenSuccess({ token });
        }),
        catchError((error: AuthError) =>
          of(AuthActions.refreshTokenFailure({ error }))
        )
      )
    )
  )
);

  // refreshToken$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(AuthActions.refreshToken),
  //     switchMap(() =>
  //       this.authService.refreshToken().pipe(
  //         map((response: AuthResponse) => {
  //           return AuthActions.refreshTokenSuccess({
  //             token: response.data.access_token,
  //           });
  //         }),
  //         catchError((error: AuthError) =>
  //           of(AuthActions.refreshTokenFailure({ error }))
  //         )
  //       )
  //     )
  //   )
  // );
}
