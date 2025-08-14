import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Role, Team } from '../../../../../../core/models/user-management.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllRoles, selectTeamsData, selectTeamsPagination } from '../../../../../../core/services/user-management/ngrx/user-management.selectors';
import { createUser, createUserSuccess, loadRoles, loadTeams, loadUsers } from '../../../../../../core/services/user-management/ngrx/user-management.actions';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateUserFormService } from './create-user-form.service';
import { FormValidationUtils } from '../../../../../../utils/form-validation.utils';
import { PaginationData } from '../../../../../../core/models/pagination.model';
import { countries } from '../../../../../../utils/countries';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-create-user-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.css'
})
export class CreateUserDialogComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  selectedRoles: Role[] = [];
  selectedTeams: Team[] = [];
  showRolesDropdown = false;
  showTeamsDropdown = false;
  countries = countries;
  roles$!: Observable<Role[]>;
  teams$!: Observable<Team[]>;
  teamsPagination$!: Observable<PaginationData>;

  createUserForm!: FormGroup;
  formValidationUtils = FormValidationUtils;

  constructor(private store: Store, private createUserFormService: CreateUserFormService, private actions$: Actions) {
    this.roles$ = this.store.select(selectAllRoles);
    this.teams$ = this.store.select(selectTeamsData);
    this.teamsPagination$ = this.store.select(selectTeamsPagination);
  }
  ngOnInit(): void {
    this.createUserForm = this.createUserFormService.createForm();
    this.loadData();
  }

  private loadData(): void {
    this.store.dispatch(loadRoles());
    this.store.dispatch(loadTeams({ query: '', page: 1, limit: 5 }));
  }

  toggleRolesDropdown(): void {
    this.showRolesDropdown = !this.showRolesDropdown;
    this.showTeamsDropdown = false;
  }
  toggleTeamsDropdown(): void {
    this.showTeamsDropdown = !this.showTeamsDropdown;
    this.showRolesDropdown = false;
  }

  selectRole(role: Role): void {
    if (!this.selectedRoles.some(r => r.id === role.id)) {
      this.selectedRoles.push(role);
      this.createUserForm.patchValue({ role: this.selectedRoles.map(r => r.id) });
    }
    this.showRolesDropdown = false;
  }

  selectTeam(team: Team): void {
    if (!this.selectedTeams.some(t => t.id === team.id)) {
      this.selectedTeams.push(team);
      this.createUserForm.patchValue({ team: this.selectedTeams.map(t => t.id) });
    }
    this.showTeamsDropdown = false;
  }

  removeRole(role: Role): void {
    this.selectedRoles = this.selectedRoles.filter(r => r.id !== role.id);
  }

  removeTeam(team: Team): void {
    this.selectedTeams = this.selectedTeams.filter(t => t.id !== team.id);
  }

  onSubmit() {
    console.log(this.createUserForm.value);
    if (this.createUserForm.valid && this.selectedRoles.length > 0 && this.selectedTeams.length > 0) {
      this.store.dispatch(createUser({
        user: {
          first_name: this.createUserForm.value.firstName,
          last_name: this.createUserForm.value.lastName,
          email: this.createUserForm.value.email,
          phone_number: this.createUserFormService.getPhoneNumber(this.createUserForm.value),
          password: this.createUserForm.value.password,
          role_id: this.createUserForm.value.role,
          team_id: this.createUserForm.value.team,
        }
      }));
      this.actions$.pipe(
        ofType(createUserSuccess),
      ).subscribe(() => {
        this.store.dispatch(
          loadUsers({ query: '', page: 1, limit: 5 })
        )
      });
      this.closeDialog();
    }
  }


  closeDialog(): void {
    this.selectedRoles = [];
    this.selectedTeams = [];
    this.close.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(): void {
    this.closeDialog();
  }
}
