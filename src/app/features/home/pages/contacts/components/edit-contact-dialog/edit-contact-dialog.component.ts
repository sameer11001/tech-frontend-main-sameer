import { Component, EventEmitter, HostListener, Input, input, Output, OnDestroy } from '@angular/core';
import { ContactModel } from '../../../../../../core/models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../../../../core/services/contact/contact.service';
import { ToastService } from '../../../../../../core/services/toast-message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-contact-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-contact-dialog.component.html',
  styleUrl: './edit-contact-dialog.component.css'
})
export class EditContactDialogComponent implements OnDestroy {
  private _contact?: ContactModel | null;
  
  @Input() 
  set contact(value: ContactModel | null | undefined) {
    if (value) {
      // Create a deep copy of the contact object to avoid read-only property errors
      this._contact = this.deepCopyContact(value);
    } else {
      this._contact = value;
    }
  }
  
  get contact(): ContactModel | null | undefined {
    return this._contact;
  }

  @Output() closeDialog = new EventEmitter<void>();
  @Output() contactUpdated = new EventEmitter<ContactModel>();

  isLoading: boolean = false;
  private subscription?: Subscription;
  private isDestroyed = false;

  constructor(
    private contactService: ContactService,
    private toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private deepCopyContact(contact: ContactModel): ContactModel {
    return {
      ...contact,
      attribute_links: contact.attribute_links ? contact.attribute_links.map(attr => ({
        ...attr,
        attribute: { ...attr.attribute }
      })) : [],
      tag_links: contact.tag_links ? [...contact.tag_links] : []
    };
  }

  closeDialogHandler(): void {
    this.closeDialog.emit();
  }

  onAddAttribute(): void {
    if (this.contact && this.contact.attribute_links) {
      this.contact.attribute_links.push({
        attribute: { name: '' },
        value: ''
      });
    }
  }

  onRemoveAttribute(index: number): void {
    if (this.contact && this.contact.attribute_links) {
      this.contact.attribute_links.splice(index, 1);
    }
  }

  onSave(): void {
    if (!this.contact) {
      this.toastService.showToast('No contact data available', 'error');
      return;
    }

    // Validate required fields
    if (!this.contact.name || !this.contact.phone_number) {
      this.toastService.showToast('Name and phone number are required', 'error');
      return;
    }

    this.isLoading = true;

    this.subscription = this.contactService.updateContact(this.contact).subscribe({
      next: (response) => {
        if (this.isDestroyed) return;
        
        this.isLoading = false;
        console.log('Contact updated successfully:', response);
        this.toastService.showToast('Contact updated successfully', 'success');
        this.contactUpdated.emit(this.contact!);
        this.closeDialogHandler();
      },
      error: (error) => {
        if (this.isDestroyed) return;
        
        this.isLoading = false;
        console.error('Error updating contact:', error);
        console.error('Error details:', error.error);
        this.toastService.showToast('Failed to update contact. Please try again.', 'error');
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.closeDialogHandler();
  }

}
