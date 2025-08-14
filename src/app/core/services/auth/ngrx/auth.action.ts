import { createAction, props } from '@ngrx/store';
import { AuthError, LoginCredentials } from '../../../../core/models/auth.types';
import { User } from '../../../../core/models/user.model';

export const login = createAction(
    '[Auth] Login Request',
    props<LoginCredentials>()
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ token: string}>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: AuthError }>()
);

export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
    '[Auth] Refresh Token Success',
    props<{ token: string}>()
);

export const refreshTokenFailure = createAction(
    '[Auth] Refresh Token Failure',
    props<{ error: AuthError }>()
);

export const logout = createAction('[Auth] Logout');

export const setAuthUser = createAction(
  '[Auth] Set Auth User',
  props<{ user: User }>()
);
