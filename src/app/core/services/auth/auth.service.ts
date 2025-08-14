import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import {
  AuthError,
  AuthErrorType,
  AuthResponse,
  LoginCredentials,
} from '../../models/auth.types';
import * as AuthActions from '../auth/ngrx/auth.action';
import { ToastService } from '../toast-message.service';
import { AuthState } from './ngrx/auth.reducer';
import { CookieService } from 'ngx-cookie-service';
import * as SocketActions from '../chat/ngrx/socket.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private basePath = 'v1/auth';
  private refreshAttempts = 0;
  private maxRefreshAttempts = 3;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private store: Store<{ auth: AuthState }>,
    private toastService: ToastService,
    private cookieService: CookieService
  ) {}


  get isAuthenticated$(): Observable<boolean> {
    return this.store.select('auth').pipe(
      map(authState => !!authState.response && !!authState.user)
    );
  }

  get currentUser$(): Observable<any> {
    return this.store.select('auth').pipe(
      map(authState => authState.user)
    );
  }

  get authToken$(): Observable<string | null> {
    return this.store.select('auth').pipe(
      map(authState => authState.response)
    );
  }

  get isLoading$(): Observable<boolean> {
    return this.store.select('auth').pipe(
      map(authState => authState.loading)
    );
  }

  get error$(): Observable<string> {
    return this.store.select('auth').pipe(
      map(authState => authState.error)
    );
  }

  get isAuthenticated(): boolean {
    let result = false;
    this.store.select('auth').pipe(take(1)).subscribe(authState => {
      result = !!authState.response && !!authState.user;
    });
    return result;
  }

  get currentUser(): any {
    let result = null;
    this.store.select('auth').pipe(take(1)).subscribe(authState => {
      result = authState.user;
    });
    return result;
  }

  get authToken(): string | null {
    let result = null;
    this.store.select('auth').pipe(take(1)).subscribe(authState => {
      result = authState.response;
    });
    return result;
  }

  getAuthTokenAsync(): Observable<string | null> {
    return this.store.select('auth').pipe(
      map(authState => authState.response),
      take(1)
    );
  }

  debugAuthState(): void {
    this.store.select('auth').pipe(take(1)).subscribe(authState => {
      console.log('[Auth] Current auth state:', authState);
      console.log('[Auth] Has response:', !!authState.response);
      console.log('[Auth] Has user:', !!authState.user);
      console.log('[Auth] Is authenticated:', !!authState.response && !!authState.user);
      console.log('[Auth] Session cookie:', document.cookie);
    });
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>(`${this.basePath}/login`, credentials)
      .pipe(
        map((response) => {
          const token = response.data.access_token;
          document.cookie = `session=${token}; path=/; Secure; SameSite=None`;
          return response;
        }),
        catchError((error) => {
          if (this.toastService.isServiceReady()) {
            this.toastService.showToast('Login failed', 'error');
          }
          return throwError(
            () =>
              new AuthError(AuthErrorType.INVALID_CREDENTIALS, error.message)
          );
        })
      );
  }

  refreshToken(): Observable<any> {
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      this.logout();
      return throwError(
        () =>
          new AuthError(
            AuthErrorType.REFRESH_FAILED,
            'Max refresh attempts exceeded'
          )
      );
    }
    this.refreshAttempts++;

    return this.apiService
      .post<AuthResponse>(`${this.basePath}/refresh`, {})
      .pipe(
        map((response: any) => {
          if (!response.success) {
            throw new Error('Refresh token request failed');
          }
          const token = response.data.access_token;
          document.cookie = `session=${token}; path=/; Secure; SameSite=None`;
          return response;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  logout() {
    this.apiService.post(`${this.basePath}/logout`, {}).subscribe({
      next: () => {
        this.performLocalLogout();
      },
      error: (error) => {
        console.error('Logout API call failed:', error);
        this.performLocalLogout();
      }
    });
  }

  private performLocalLogout() {
    this.store.dispatch(SocketActions.disconnectSocket());
    
    document.cookie = 'session=; Max-Age=0; path=/; Secure; SameSite=None';
    this.cookieService.delete('session', '/');
    this.store.dispatch(AuthActions.logout());
    this.refreshAttempts = 0;
    this.router.navigate(['auth/sign-in']);
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Something went wrong'));
  }
}
