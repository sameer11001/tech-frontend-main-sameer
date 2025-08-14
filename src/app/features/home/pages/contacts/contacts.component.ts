import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactHeaderComponent } from './components/contact-header/contact-header.component';
import { ContactTableComponent } from "./components/contact-table/contact-table.component";
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { EditContactDialogComponent } from "./components/edit-contact-dialog/edit-contact-dialog.component";
import { ContactModel } from '../../../../core/models/contact.model';
import { Store } from '@ngrx/store';
import { getContacts } from '../../../../core/services/contact/ngrx/contact.actions';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactHeaderComponent, CommonModule, ContactTableComponent, PaginationComponent, EditContactDialogComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent {
  contact: ContactModel | null = null;
  editContactDialog: boolean = false;

  searchTerm: string = '';
  currentPage: number = 1;
  limit: number = 5;
  paginationData?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };

  constructor(private store: Store) {}

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
  }

  paginationChangeHandler(paginationData: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }) {
    this.paginationData = paginationData;
    this.currentPage = paginationData.currentPage;
    this.limit = paginationData.limit;
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
  }

  onLimitChange(newLimit: number) {
    this.limit = newLimit;
    this.currentPage = 1;
  }

  onEditContact(contact: ContactModel | null = null) {
    this.editContactDialog = !this.editContactDialog;
    this.contact = contact;
  }

  onContactUpdated(updatedContact: ContactModel) {
    // Refresh the contact list to show the updated data
    console.log('Contact updated:', updatedContact);
    this.store.dispatch(getContacts({
      page: this.currentPage,
      limit: this.limit,
      searchTerm: this.searchTerm
    }));
  }

}
