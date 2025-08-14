import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.action';

export interface AuthState {
    loading: boolean;
    error: string;
    response: any;
    user: any | null;
}

const initialState: AuthState = {
    loading: false,
    error: '',
    response: null,
    user: null,
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.login, (state) => ({
        ...state,
        loading: true,
        error: ''
    })),
    on(AuthActions.loginSuccess, (state, { token }) => ({
        ...state,
        loading: false,
        response: token,
        user: { id: 'user', token }, // Add a default user object
        error: ''
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error.message
    })),
    on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
        ...state,
        response: token,
    })),
    on(AuthActions.logout, () => {
         document.cookie = 'session=; Max-Age=0; path=/; Secure; SameSite=None';
        return initialState;
    }),
    on(AuthActions.setAuthUser, (state, { user }) => ({
      ...state,
      user
    }))

);
