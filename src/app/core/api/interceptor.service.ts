import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  Observable,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import * as AuthActions from '../services/auth/ngrx/auth.action';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private token: string | null = null;
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
      headers: request.headers.set('ngrok-skip-browser-warning', 'true'),
    });

    if (this.shouldSkipAuth(request)) {
      return next.handle(request);
    }

    const currentToken = this.authService.authToken;

    let clonedRequest = request;

    if (currentToken) {
      clonedRequest = this.addToken(request, currentToken);
      this.token = currentToken;
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSkipAuth(request: HttpRequest<any>): boolean {
    const publicUrls = [
      '/v1/auth/login',
      '/v1/auth/sign-in',
      '/v1/auth/refresh',
      '/v1/auth/register',
      'tech-gate-s3.s3.eu-north-1.amazonaws.com'
    ];
    return publicUrls.some((url) => request.url.includes(url));
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          if (response && response.success === false) {
            return this.handleUnauthorizedError();
          }
          this.store.dispatch(
            AuthActions.refreshTokenSuccess({
              token: response.data.access_token,
            })
          );
          this.refreshTokenSubject.next(response.data.access_token);
          this.token = response.data.access_token;
          return next
            .handle(this.addToken(request, response.data.access_token))
            .pipe(catchError(() => this.handleUnauthorizedError()));
        }),
        catchError(() => {
          this.isRefreshing = false;
          return this.handleUnauthorizedError();
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token)))
    );
  }
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  private handleUnauthorizedError(): Observable<never> {
    this.authService.logout();
    this.router.navigate(['auth/sign-in']);
    return throwError(() => new Error('Unauthorized'));
  }
}
