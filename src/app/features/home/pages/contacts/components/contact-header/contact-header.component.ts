import { Component, EventEmitter, Output } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ContactHeaderAddContactDialogComponent } from "./components/contact-header-add-contact-dialog/contact-header-add-contact-dialog.component";

@Component({
  selector: 'app-contact-header',
  imports: [ContactHeaderAddContactDialogComponent],
  templateUrl: './contact-header.component.html',
  styleUrl: './contact-header.component.css'
})
export class ContactHeaderComponent {
  addContactDialog: boolean = false
  
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
  onSearchChange(searchTerm: EventTarget | null) {
    if (!searchTerm) return;
    const searchTermValue = (searchTerm as HTMLInputElement).value;
    this.searchSubject$.next(searchTermValue);
  }

  addContactDialogHandler() {
    this.addContactDialog = !this.addContactDialog;
  }

}
