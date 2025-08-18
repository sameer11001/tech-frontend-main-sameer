// src/app/guards/auth-socket.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanMatch,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlSegment,
  Route
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  take,
  switchMap,
  map,
  tap,
  catchError,
  filter
} from 'rxjs/operators';

import { UserService } from '../services/auth/user.service';
import { selectAuthUser } from '../services/auth/ngrx/auth.selector';
import { setAuthUser } from '../services/auth/ngrx/auth.action';
import * as SocketActions from '../services/chat/ngrx/socket.actions';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanMatch {
  constructor(
    private store: Store,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuthAndSocket();
  }

  canMatch(_route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.checkAuthAndSocket();
  }

  private checkAuthAndSocket(): Observable<boolean> {
    return this.store.select(selectAuthUser).pipe(
      take(1),
      switchMap(authUser =>
        this.userService.fetchUserFromAPI().pipe(
          map(response => response.data),
          tap(user => {
            if (!authUser) {
              this.store.dispatch(setAuthUser({ user }));
            }
            if (user.roles && user.roles.some((role: any) => role.role_name === 'ADMINISTRATOR')) {
              this.store.dispatch(SocketActions.connectSocket());
            }
          }),
          map(user => !!user),
          catchError(() => {
            this.router.navigate(['auth/sign-in']);
            return of(false);
          })
        )
      )
    );
  }
}
