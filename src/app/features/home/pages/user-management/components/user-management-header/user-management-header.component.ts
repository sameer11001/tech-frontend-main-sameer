import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-management-header',
  standalone: true,
  imports: [],
  templateUrl: './user-management-header.component.html',
  styleUrl: './user-management-header.component.css'
})
export class UserManagementHeaderComponent {
  @Input() activeTab: 'users' | 'teams' = 'users';
  @Output() tabChanged = new EventEmitter<'users' | 'teams'>();
  @Output() createUser = new EventEmitter<void>();
  @Output() createTeam = new EventEmitter<void>();
  @Output() searchChanged = new EventEmitter<string>();

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject$.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(
      value => this.searchChanged.emit(value)
    )
  }
  setActiveTab(isTeam: boolean) {
    const newTab = isTeam ? 'teams' : 'users';
    this.tabChanged.emit(newTab);
  }

  openCreateUserDialog() {
    this.createUser.emit();
  }

  openCreateTeamDialog() {
    this.createTeam.emit();
  }

  onSearchChange(searchTerm: EventTarget | null) {
    if (!searchTerm) return;
    const searchTermValue = (searchTerm as HTMLInputElement).value;
    this.searchSubject$.next(searchTermValue);
  }


}
