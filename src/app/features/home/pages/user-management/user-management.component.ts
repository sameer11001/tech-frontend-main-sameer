import { Component, OnDestroy, OnInit } from '@angular/core';

import { UserManagementHeaderComponent } from "./components/user-management-header/user-management-header.component";
import { UserManagementTableComponent } from "./components/user-management-table/user-management-table.component";
import { User, Team } from '../../../../core/models/user-management.model';
import { Store } from '@ngrx/store';
import { CreateUserDialogComponent } from "./components/create-user-dialog/create-user-dialog.component";
import { EditUserDialogComponent } from "./components/edit-user-dialog/edit-user-dialog.component";
import { AddTeamComponent } from "./components/add-team/add-team.component";
import { EditTeamComponent } from "./components/edit-team/edit-team.component";
import { ConfirmDialogComponent } from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import { Actions, ofType } from '@ngrx/effects';
import { deleteTeam, deleteTeamSuccess, loadTeams } from '../../../../core/services/user-management/ngrx/user-management.actions';

@Component({
  selector: 'app-user-dashboard-table',
  standalone: true,
  imports: [
    UserManagementHeaderComponent,
    UserManagementTableComponent,
    CreateUserDialogComponent,
    EditUserDialogComponent,
    AddTeamComponent,
    EditTeamComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserDashboardTableComponent {
  activeTab: 'users' | 'teams' = 'users';
  user?: User;
  team?: Team;
  createUserDialog: boolean = false;
  editUserDialog: boolean = false;
  addTeamDialog: boolean = false;
  editTeamDialog: boolean = false;
  searchQuery: string = '';
  deleteTeamDialog: boolean = false;
  teamName: string = '';
  sidebarOpen: boolean = false;

  constructor(private store: Store, private actions$: Actions) { }

  onTabChanged(newTab: 'users' | 'teams') {
    this.activeTab = newTab;
  }

  createUserDialogHandler() {
    this.createUserDialog = !this.createUserDialog;
  }

  editUserDialogHandler() {
    this.editUserDialog = !this.editUserDialog;
  }

  addTeamDialogHandler() {
    this.addTeamDialog = !this.addTeamDialog;
  }

  editTeamDialogHandler() {
    this.editTeamDialog = !this.editTeamDialog;
  }

  editUserClick(user: User) {
    this.user = user;
    this.editUserDialog = true;
  }

  editTeamClick(team: Team) {
    this.team = team;
    this.editTeamDialog = true;
  }

  onSearchChange(searchTerm: string) {
    console.log(searchTerm);
    this.searchQuery = searchTerm;
  }

  deleteTeamDialogHandler(teamName: string) {
    this.deleteTeamDialog = !this.deleteTeamDialog;
    this.teamName = teamName;
  }

  confirmDeleteTeam(): void {
    this.store.dispatch(deleteTeam({ teamName: this.teamName }));
    this.actions$.pipe(
      ofType(deleteTeamSuccess),
    ).subscribe(() => {
      this.deleteTeamDialog = false;
      // Refresh teams data after successful deletion
      this.store.dispatch(loadTeams({ query: '', page: 1, limit: 10 }));
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
