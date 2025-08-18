import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../../../core/services/auth/ngrx/auth.selector';
import { UserService } from '../../../../../../core/services/auth/user.service';
import { ProfileSettingsService } from '../../../../../../core/services/profile-settings/profile-settings.service';
import { ToastService } from '../../../../../../core/services/toast-message.service';
import { Subject, takeUntil, filter } from 'rxjs';
import * as AuthActions from '../../../../../../core/services/auth/ngrx/auth.action';

@Component({
  selector: 'app-personal-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-profile.component.html',
  styleUrls: ['./personal-profile.component.css']
})
export class PersonalProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentUser: any = null;
  isSaving = false;

  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    phoneNumber: new FormControl(''),
    roles: new FormControl({ value: '', disabled: true }),
    teams: new FormControl({ value: '', disabled: true }),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  constructor(
    private store: Store,
    private userService: UserService,
    private profileSettingsService: ProfileSettingsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData() {
    // Single subscription to user data from store
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(userData => {
        console.log('Current user data in store:', userData);
        
        if (userData && userData.data) {
          // User data exists, populate the form
          console.log('User data received:', userData);
          this.currentUser = userData;
          this.populateForm(userData);
        } else {
          // No user data in store, load it from API
          console.log('No user data found in store, loading from API');
          this.userService.loadAndSetUser();
        }
      });
  }

  populateForm(userData: any) {
    console.log('Populating form with user data:', userData);
    if (userData.data) {
      this.profileForm.patchValue({
        firstName: userData.data.first_name || '',
        lastName: userData.data.last_name || '',
        email: userData.data.email || '',
        phoneNumber: userData.data.phone_number || '',
        roles: userData.data.roles ? userData.data.roles.map((role: any) => role.role_name).join(', ') : '',
        teams: userData.data.teams ? userData.data.teams.map((team: any) => team.name).join(', ') : '',
      });
      console.log('Form populated with values:', this.profileForm.value);
    }
  }

  onSave() {
    if (!this.currentUser || !this.currentUser.data || !this.currentUser.data.id) {
      console.error('No user ID available');
      this.toastService.showToast('No user ID available', 'error');
      return;
    }

    const formValue = this.profileForm.value;
    
    // Validate required fields
    if (!formValue.firstName || !formValue.lastName || !formValue.email) {
      this.toastService.showToast('Please fill in all required fields (First Name, Last Name, Email)', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValue.email)) {
      this.toastService.showToast('Please enter a valid email address', 'error');
      return;
    }
    
    // Validate passwords if new password is provided
    if (formValue.newPassword && formValue.newPassword !== formValue.confirmPassword) {
      console.error('New password and confirm password do not match');
      this.toastService.showToast('New password and confirm password do not match', 'error');
      return;
    }

    this.isSaving = true;
    this.profileForm.disable();

    // Prepare the request body according to the API specification
    const requestBody: any = {
      first_name: formValue.firstName || '',
      last_name: formValue.lastName || '',
      email: formValue.email || '',
      phone_number: formValue.phoneNumber || '',
      roles: this.currentUser.data.roles ? this.currentUser.data.roles.map((role: any) => role.id) : [],
      teams: this.currentUser.data.teams ? this.currentUser.data.teams.map((team: any) => team.id) : []
    };

    // Add new password to request body if provided
    if (formValue.newPassword) {
      requestBody.new_password = formValue.newPassword;
    }

    console.log('Sending update request:', requestBody);

    this.profileSettingsService.updateUserProfile(this.currentUser.data.id, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.toastService.showToast('Profile updated successfully', 'success');
          // Refresh user data after successful update
          this.userService.loadAndSetUser();
          this.isSaving = false;
          this.profileForm.enable();
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.toastService.showToast('Failed to update profile', 'error');
          this.isSaving = false;
          this.profileForm.enable();
        }
      });
  }
}
