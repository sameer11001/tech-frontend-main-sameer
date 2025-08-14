import { createReducer, on } from '@ngrx/store';
import {  Role, Team, User } from '../../../models/user-management.model';
import { createTeam, createTeamFailure, createTeamSuccess, createUser, createUserFailure, createUserSuccess, deleteTeam, deleteTeamFailure, deleteTeamSuccess, deleteUser, deleteUserFailure, deleteUserSuccess, forceLogout, forceLogoutFailure, forceLogoutSuccess, forceResetPassword, forceResetPasswordFailure, forceResetPasswordSuccess, loadRoles, loadRolesFailure, loadRolesSuccess, loadTeams, loadTeamsFailure, loadTeamsSuccess, loadUsers, loadUsersFailure, loadUsersSuccess, resetState, updateTeam, updateTeamFailure, updateTeamSuccess, updateUser, updateUserFailure, updateUserSuccess } from './user-management.actions';
import { PaginationData } from '../../../models/pagination.model';


export interface UserManagementState {
  users: {
    data: User[];
    pagination: PaginationData;
  };
  teams: {
    data: Team[];
    pagination: PaginationData;
  };
  roles: Role[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
}

export const initialState: UserManagementState = {
  users: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total_count: 0,
      total_pages: 0
    }
  },
  roles: [],
  teams: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total_count: 0,
      total_pages: 0
    }
  },
  pagination: {
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0
  },
  loading: false,
  error: null
};

export const userManagementReducer = createReducer(
  initialState,

  // Loading States
  on(
    forceResetPassword,
    forceLogout,
    deleteUser,
    loadRoles,
    loadTeams,
    updateUser,
    createUser,
    loadUsers,
    createTeam,
    updateTeam,
    deleteTeam,
    (state) => ({ ...state, loading: true, error: null })
  ),

  // Success Handlers
  on(
    loadUsersSuccess,
    (state, { users, ...pagination }) => ({
      ...state,
      loading: false,
      users: {
        data: users,
        pagination
      },
      pagination
    })
  ),
  on(
    loadTeamsSuccess,
    (state, { teams, ...pagination }) => ({
      ...state,
      loading: false,
      teams: {
        data: teams,
        pagination
      },
      pagination
    })
  ),
  on(
    loadRolesSuccess,
    (state, { roles }) => ({
      ...state,
      loading: false,
      roles
    })
  ),
  on(
    forceResetPasswordSuccess,
    forceLogoutSuccess,
    deleteUserSuccess,
    updateUserSuccess,
    createUserSuccess,
    createTeamSuccess,
    updateTeamSuccess,
    deleteTeamSuccess,
    (state) => ({ ...state, loading: false })
  ),

  // Failure Handlers
  on(
    forceResetPasswordFailure,
    forceLogoutFailure,
    deleteUserFailure,
    loadRolesFailure,
    loadTeamsFailure,
    updateUserFailure,
    createUserFailure,
    loadUsersFailure,
    createTeamFailure,
    updateTeamFailure,
    deleteTeamFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),


  on(
    resetState,
    () => initialState
  )
);