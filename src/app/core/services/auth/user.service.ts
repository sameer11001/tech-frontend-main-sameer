import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, catchError, throwError } from 'rxjs';
import { selectAuthUser } from './ngrx/auth.selector';
import * as AuthActions from './ngrx/auth.action';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private basePath = 'v1/user/';
  private isLoadingUser = false;

  constructor(
    private store: Store,
    private apiService: ApiService
  ) {}

  // Get user data from store
  getUser(): Observable<any> {
    return this.store.select(selectAuthUser);
  }

  // Load user data from API and set it in store
  loadAndSetUser(): void {
    // Prevent multiple simultaneous API calls
    if (this.isLoadingUser) {
      console.log('User data is already being loaded, skipping duplicate request');
      return;
    }

    this.isLoadingUser = true;
    console.log('Loading user data from API...');

    this.fetchUserFromAPI().subscribe({
      next: (response) => {
        this.isLoadingUser = false;
        if (response.success && response.data) {
          console.log('User data loaded successfully, setting in store');
          this.store.dispatch(AuthActions.setAuthUser({ user: response }));
        }
      },
      error: (error) => {
        this.isLoadingUser = false;
        console.error('Failed to load user data:', error);
      }
    });
  }

  // Set user data in store
  setUser(user: any): void {
    this.store.dispatch(AuthActions.setAuthUser({ user }));
  }

  // Check if user data is currently being loaded
  isUserLoading(): boolean {
    return this.isLoadingUser;
  }

  // Fetch user data from API
  fetchUserFromAPI(): Observable<any> {
    const endpoint = `${this.basePath}`;
    return this.apiService.get(endpoint).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any) {
    return throwError(() => new Error(error.message || "Something went wrong"));
  }
} 