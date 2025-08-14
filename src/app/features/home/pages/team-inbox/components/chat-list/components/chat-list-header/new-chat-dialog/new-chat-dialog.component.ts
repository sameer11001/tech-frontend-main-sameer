import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { getContacts } from '../../../../../../../../../core/services/contact/ngrx/contact.actions';
import { CreateContactFormService } from '../../../../../../contacts/components/contact-header/components/contact-header-add-contact-dialog/create-contact-form.service';
import { FormValidationUtils } from '../../../../../../../../../utils/form-validation.utils';
import { countries } from '../../../../../../../../../utils/countries';
import { selectContacts, selectLoading, selectPagination } from '../../../../../../../../../core/services/contact/ngrx/contact.selectors';

@Component({
  selector: 'app-new-chat-dialog',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './new-chat-dialog.component.html',
  styleUrls: ['./new-chat-dialog.component.css'],
})
export class NewChatDialogComponent implements OnInit {
  contactForm: FormGroup;
  public formUtils = FormValidationUtils;
  public countries = countries;

  contacts$             = this.store.select(selectContacts);
  contactsLoading$      = this.store.select(selectLoading);
  contactsPagination$   = this.store.select(selectPagination);
  showContactsDropdown  = false;

  constructor(
    private store: Store,
    public formService: CreateContactFormService,
    private dialogRef: MatDialogRef<NewChatDialogComponent>,
  ) {
    this.contactForm = this.formService.createContactForm();
  }

  ngOnInit() {
    this.loadContacts(1);
  }

  private loadContacts(page: number) {
    this.store.dispatch(getContacts({ page, limit: 10 }));
  }

  toggleContactsDropdown() {
    this.showContactsDropdown = !this.showContactsDropdown;
  }

  onContactsScroll(event: Event) {
    const el = event.target as HTMLElement;
    const atBottom = Math.abs((el.scrollHeight - el.scrollTop) - el.clientHeight) < 1;
    if (!atBottom) return;

    this.contactsPagination$.pipe(take(1)).subscribe(p => {
      if (p.currentPage < p.totalPages) {
        this.loadContacts(p.currentPage + 1);
      }
    });
  }

  selectContact(contact: any) {
    this.contactForm.patchValue({
      name: contact.name,
      countryCode: contact.countryCode,
      phoneNumber: contact.phoneNumber
    });
    this.showContactsDropdown = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const fv = this.contactForm.value;
      this.dialogRef.close();
    } else {
      Object.values(this.contactForm.controls).forEach(c => c.markAsTouched());
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
