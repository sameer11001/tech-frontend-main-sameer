import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ContactModel } from '../../../../../../core/models/contact.model';
import { Pagination } from '../../../../../../core/services/contact/ngrx/contact.reducer';
import { deleteContact, deleteContactSuccess, getContacts } from '../../../../../../core/services/contact/ngrx/contact.actions';
import { selectContacts, selectError, selectLoading, selectPagination } from '../../../../../../core/services/contact/ngrx/contact.selectors';
import { ConfirmDialogComponent } from "../../../../../../shared/components/confirm-dialog/confirm-dialog.component";
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-contact-table',
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './contact-table.component.html',
  styleUrl: './contact-table.component.css'
})
export class ContactTableComponent implements OnInit, OnChanges {

  @Input() searchTerm: string = '';
  @Input() currentPage: number = 1;
  @Input() limit: number = 5;
  @Output() paginationChange = new EventEmitter<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }>();
  @Output() contactSelected = new EventEmitter<ContactModel>();

  contacts$: Observable<ContactModel[]>;
  contactsPagination$: Observable<Pagination>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  deleteDialog: boolean = false;
  isExpanded = false;
  currentLimit = 5;
  contactIdSelected: string = '';


  constructor(private store: Store, private actions$: Actions) {
    this.contacts$ = this.store.select(selectContacts);
    this.contactsPagination$ = this.store.select(selectPagination);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['currentPage'] || changes['limit']) {
      this.loadData(this.currentPage);
    }
  }


  ngOnInit() {
    this.loadData(this.currentPage);

    this.contactsPagination$.subscribe(pagination => {
      this.paginationChange.emit({
        totalCount: pagination.totalCount,
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        limit: pagination.limit
      });
    });
  }


  loadData(page: number) {
    this.store.dispatch(getContacts({
      page,
      limit: this.limit,
      searchTerm: this.searchTerm
    }));
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  deleteContact() {
    this.store.dispatch(deleteContact({ id: this.contactIdSelected }));
    this.actions$.pipe(ofType(deleteContactSuccess)).subscribe(() => {
      this.loadData(this.currentPage);
      this.deleteDialog = false;
    });
  }

  deleteCloseDialog() {
    this.deleteDialog = false;
  }

  deleteOpenDialog(id: string) {
    this.contactIdSelected = id;
    this.deleteDialog = true;
  }

  editContact(contact: ContactModel) {
    this.contactSelected.emit(contact);
  }
}


