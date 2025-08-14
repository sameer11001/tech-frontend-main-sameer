import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as ProfileSettings from '../../../../../../core/services/profile-settings/ngrx/profile-settings.actions';
import { Observable } from 'rxjs';
import { selectProfileData, selectLoading } from '../../../../../../core/services/profile-settings/ngrx/profile-settings.selectors';
import { businessProfileModel } from '../../../../../../core/models/business-profile-model';
import { ProfileSettingsService } from '../../../../../../core/services/profile-settings/profile-settings.service';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
})
export class BusinessProfileComponent implements OnInit {
  businessProfile$: businessProfileModel | null = null;
  profileForm!: FormGroup;
  imageFile: File | null = null;
  loading = false;
  imagePreviewUrl: string | null = null;
  initialFormValue: any = null;

  constructor(
    private store: Store,
    private profileService: ProfileSettingsService,
    private actions$: Actions,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(ProfileSettings.getBusinessProfile());
    this.store.select(selectProfileData).subscribe(
      (data) => {
        this.businessProfile$ = data;
        // Initialize form when data is loaded
        if (data && data.data && data.data.business_profile && data.data.business_profile.data && data.data.business_profile.data.length > 0) {
          const item = data.data.business_profile.data[0];
          this.profileForm = new FormGroup({
            about: new FormControl(item.about),
            address: new FormControl(item.address),
            description: new FormControl(item.description),
            email: new FormControl(item.email),
            websites1: new FormControl(item.websites?.[0] || ''),
            websites2: new FormControl(item.websites?.[1] || ''),
            vertical: new FormControl(item.vertical),
            image: new FormControl(null),
          });
          this.initialFormValue = this.profileForm.getRawValue();
          this.imagePreviewUrl = item.profile_picture_url || null;
          this.profileForm.valueChanges.subscribe(() => {
            // This will trigger change detection for the Save button
          });
        }
      }
    );
    this.store.select(selectLoading).subscribe(loading => {
      this.loading = loading;
    });
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  get canSave(): boolean {
    if (!this.profileForm || !this.initialFormValue) return false;
    // Check if form is dirty or a new image is selected
    const current = this.profileForm.getRawValue();
    const changed = Object.keys(current).some(key => current[key] !== this.initialFormValue[key]);
    return changed || !!this.imageFile;
  }

  onSubmit() {
    if (!this.profileForm) return;
    const formValue = this.profileForm.value;
    const formData = new FormData();
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
    formData.append('description', formValue.description || '');
    formData.append('about', formValue.about || '');
    formData.append('email', formValue.email || '');
    formData.append('websites', [formValue.websites1, formValue.websites2].filter(Boolean).join(','));
    formData.append('vertical', formValue.vertical || '');
    formData.append('address', formValue.address || '');
    this.store.dispatch(ProfileSettings.updateBusinessProfile({ formData }));
    this.actions$.pipe(ofType(ProfileSettings.updateBusinessProfileSuccess)).subscribe({
      next: (data) => {
        this.store.dispatch(ProfileSettings.getBusinessProfile());
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
