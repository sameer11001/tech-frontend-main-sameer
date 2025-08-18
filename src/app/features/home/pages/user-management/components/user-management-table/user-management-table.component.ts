import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {Team, User } from '../../../../../../core/models/user-management.model';
import {
  selectUsersData,
  selectTeamsData,
  selectUsersPagination,
  selectTeamsPagination,
  selectErrorMessage,
  selectLoadingState
} from '../../../../../../core/services/user-management/ngrx/user-management.selectors';
import { loadTeams, loadUsers } from '../../../../../../core/services/user-management/ngrx/user-management.actions';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { UserActionsDropdownComponent } from "../user-actions-dropdown/user-actions-dropdown.component";
import { deleteTag } from '../../../../../../core/services/tags/ngrx/tags.actions';
import { PaginationData } from '../../../../../../core/models/pagination.model';

@Component({
  standalone: true,
  selector: 'app-user-management-table',
  templateUrl: './user-management-table.component.html',
  styleUrls: ['./user-management-table.component.css'],
  imports: [
    CommonModule,
    PaginationComponent,
    UserActionsDropdownComponent
  ]
})
export class UserManagementTableComponent implements OnInit, OnChanges {
  @Input() activeTab: 'users' | 'teams' = 'users';
  @Input() searchQuery: string = '';
  @Output() editUserHandler = new EventEmitter<User>();
  @Output() editTeamHandler = new EventEmitter<Team>();
  @Output() deleteTeamDialog = new EventEmitter<string>();
  currentLimit = 5;


  users$: Observable<User[]>;
  teams$: Observable<Team[]>;
  usersPagination$: Observable<PaginationData>;
  teamsPagination$: Observable<PaginationData>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store) {
    this.users$ = this.store.select(selectUsersData);
    this.teams$ = this.store.select(selectTeamsData);
    this.usersPagination$ = this.store.select(selectUsersPagination);
    this.teamsPagination$ = this.store.select(selectTeamsPagination);
    this.loading$ = this.store.select(selectLoadingState);
    this.error$ = this.store.select(selectErrorMessage);
  }

  ngOnInit() { this.loadData(1); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] || changes['searchQuery']) {
      this.loadData(1);
    }
  }

  private loadData(page: number): void {
    const action = this.activeTab === 'users' ? loadUsers : loadTeams;
    this.store.dispatch(action({
      query: this.searchQuery,
      page,
      limit: this.currentLimit
    }));
  }

  handlePageChange(newPage: number): void {
    this.loadData(newPage);
  }

  handleLimitChange(newLimit: number): void {
    this.currentLimit = newLimit;
    this.loadData(1);
  }

  editUserClick(user: User): void {
    this.editUserHandler.emit(user);
  }

  editTeamClick(team: Team): void {
    this.editTeamHandler.emit(team);
  }

  teamDeleteDialogHandler(teamName: string): void {
    this.deleteTeamDialog.emit(teamName);
  }

  trackByUserId(index: number, user: User): string | number {
    return user.id;
  }

  trackByTeamId(index: number, team: Team): string | number {
    return team.id;
  }
}
