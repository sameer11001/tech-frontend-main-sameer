import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../../../core/services/auth/ngrx/auth.selector';

@Component({
  selector: 'app-personal-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-profile.component.html',
  styleUrls: ['./personal-profile.component.css']
})
export class PersonalProfileComponent {

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

  constructor(private store: Store) {
    this.loadUserData();
  }

  loadUserData() {
    this.store.select(selectAuthUser).subscribe(data => {
      if (data) {
        console.log(data);
        this.profileForm.patchValue({
          firstName: data.data.first_name,
          lastName: data.data.last_name,
          email: data.data.email,
          phoneNumber: data.data.phone_number,
          roles: data.data.roles.map((role: any) => role.role_name).join(', '),
          teams: data.data.teams.map((team: any) => team.name).join(', '),
        });
      }
    });
  }

  onSave() {
    console.log(this.profileForm.value);
    
  }
}
