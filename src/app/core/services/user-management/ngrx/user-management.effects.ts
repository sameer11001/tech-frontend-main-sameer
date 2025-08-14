// store/effects/user-management.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { UserManagementService } from '../user-management.service';
import { createTeam, createTeamFailure, createTeamSuccess, createUser, createUserFailure, createUserSuccess, deleteUser, deleteUserFailure, deleteUserSuccess, forceLogout, forceLogoutFailure, forceLogoutSuccess, forceResetPassword, forceResetPasswordFailure, forceResetPasswordSuccess, loadRoles, loadRolesFailure, loadRolesSuccess, loadTeams, loadTeamsFailure, loadTeamsSuccess, loadUsers, loadUsersFailure, loadUsersSuccess, updateTeam, updateTeamSuccess, updateTeamFailure, updateUser, updateUserFailure, updateUserSuccess, deleteTeamSuccess, deleteTeam, deleteTeamFailure } from './user-management.actions';

@Injectable()
export class UserManagementEffects {
  constructor(
    private actions$: Actions,
    private userService: UserManagementService
  ) { }

  // User Effects
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(({ query, page, limit }) =>
        this.userService.getUsers(query, page, limit).pipe(
          map((response) =>
            loadUsersSuccess({
              ...response.data
            })
          ),
          catchError((error) =>
            of(loadUsersFailure({ error: error }))
          )
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mergeMap(({ user }) =>
        this.userService.createUser(user).pipe(
          map(() => createUserSuccess()),
          catchError((error) =>
            of(createUserFailure({ error: error }))
          )
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      mergeMap(({ userId, user }) =>
        this.userService.updateUser(userId, user).pipe(
          map(() => updateUserSuccess()),
          catchError((error) =>
            of(updateUserFailure({ error: error }))
          )
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteUser),
      mergeMap(({ user_id  }) =>
        this.userService.deleteUser(user_id).pipe(
          map(() => deleteUserSuccess()),
          catchError((error) =>
            of(deleteUserFailure({ error: error }))
          )
        )
      )
    )
  );

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRoles),
      switchMap(() =>
        this.userService.getRoles().pipe(
          map((response) =>
            loadRolesSuccess({
              roles: response.data.roles
            })
          ),
          catchError((error) =>
            of(loadRolesFailure({ error: error }))
          )
        )
      )
    )
  );

  loadTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTeams),
      switchMap(({ query, page, limit }) =>
        this.userService.getTeams(query, page, limit).pipe(
          map((response) =>
            loadTeamsSuccess({
              ...response.data
            })
          ),
          catchError((error) =>
            of(loadTeamsFailure({ error: error }))
          )
        )
      )
    )
  );

  createTeam$ = createEffect(() =>

    this.actions$.pipe(
      ofType(createTeam),
      mergeMap(({ teamName }) =>
        this.userService.createTeam(teamName).pipe(
          map(() => createTeamSuccess()),
          catchError((error) =>
            of(createTeamFailure({ error: error }))
          )
        )
      )
    )
  );

  updateTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTeam),
      mergeMap(({ teamId, team }) =>
        this.userService.updateTeam(teamId, team).pipe(
          map(() => updateTeamSuccess()),
          catchError((error) =>
            of(updateTeamFailure({ error: error }))
          )
        )
      )
    )
  );

  deleteTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTeam),
      mergeMap(({ teamName }) =>
        this.userService.deleteTeam(teamName).pipe(
          map(() => deleteTeamSuccess()),
          catchError((error) =>
            of(deleteTeamFailure({ error: error.error.message }))
          )
        )
      )
    )
  );


  forceResetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(forceResetPassword),
      mergeMap(({ userId, newPassword }) =>
        this.userService.forceResetPassword(userId, newPassword).pipe(
          map(() => forceResetPasswordSuccess()),
          catchError((error) =>
            of(forceResetPasswordFailure({ error: error }))
          )
        )
      )
    )
  );

  forceLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(forceLogout),
      mergeMap(({ userId }) =>
        this.userService.forceLogout(userId).pipe(
          map(() => forceLogoutSuccess()),
          catchError((error) =>
            of(forceLogoutFailure({ error: error }))
          )
        )
      )
    )
  );
}
