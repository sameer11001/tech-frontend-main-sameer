import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, tap } from 'rxjs';

import { getAttributes } from '../../../../../../../../core/services/attributes/ngrx/attributes.actions';
import { selectAttributesList, selectAttributesLoading, selectAttributesPagination } from '../../../../../../../../core/services/attributes/ngrx/attributes.selectors';
import { Attribute } from '../../../../../../../../core/models/attribute.model';
import { PaginationData } from '../../../../../../../../core/models/pagination.model';
import { countries } from '../../../../../../../../utils/countries';
import { createContact } from '../../../../../../../../core/services/contact/ngrx/contact.actions';
import { CreateContactFormService } from './create-contact-form.service';
import { FormValidationUtils } from '../../../../../../../../utils/form-validation.utils';

@Component({
  selector: 'app-contact-header-add-contact-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-header-add-contact-dialog.component.html',
  styleUrls: ['./contact-header-add-contact-dialog.component.css']
})
export class ContactHeaderAddContactDialogComponent implements OnInit {
  @Output() closeDialog = new EventEmitter<void>();

  contactForm: FormGroup;
  showDropdownMap: { [key: number]: boolean } = {};
  countries = countries;

  attributes$: Observable<Attribute[]>;
  pagination$: Observable<PaginationData>;
  loading$: Observable<boolean>;
  currentPage = 1;

  public formUtils = FormValidationUtils;

  constructor(
    private store: Store,
    public formService: CreateContactFormService
  ) {
    this.contactForm = this.formService.createContactForm();
    this.loading$ = this.store.select(selectAttributesLoading);
    this.pagination$ = this.store.select(selectAttributesPagination);

    this.attributes$ = combineLatest([
      this.store.select(selectAttributesList),
      this.pagination$
    ]).pipe(
      map(([attributes, pagination]) => {
        this.currentPage = pagination.page;
        return attributes;
      })
    );
  }

  ngOnInit(): void {
    this.loadAttributes(1);
  }

  get customAttributes(): FormArray {
    return this.contactForm.get('customAttributes') as FormArray;
  }

  addCustomAttribute(): void {
    this.formService.addCustomAttribute(this.contactForm);
    const newIndex = this.customAttributes.length - 1;
    this.showDropdownMap[newIndex] = false;
  }

  removeCustomAttribute(index: number): void {
    this.formService.removeCustomAttribute(this.contactForm, index);
    this.updateDropdownMap(index);
  }

  private updateDropdownMap(removedIndex: number): void {
    const updatedMap: { [key: number]: boolean } = {};
    Object.keys(this.showDropdownMap).forEach(key => {
      const numKey = parseInt(key);
      if (numKey < removedIndex) {
        updatedMap[numKey] = this.showDropdownMap[numKey];
      } else if (numKey > removedIndex) {
        updatedMap[numKey - 1] = this.showDropdownMap[numKey];
      }
    });
    this.showDropdownMap = updatedMap;
  }

  toggleDropdown(index: number): void {
    Object.keys(this.showDropdownMap).forEach(key => {
      if (parseInt(key) !== index) {
        this.showDropdownMap[parseInt(key)] = false;
      }
    });
    this.showDropdownMap[index] = !this.showDropdownMap[index];
  }

  selectAttribute(attr: Attribute, index: number): void {
    const attributeForm = this.customAttributes.at(index) as FormGroup;
    attributeForm.patchValue({
      attributeId: attr.id,
      attributeName: attr.name
    });
    this.showDropdownMap[index] = false;
  }

  loadAttributes(page: number): void {
    this.store.dispatch(getAttributes({
      page,
      limit: 10,
      searchTerm: ''
    }));
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const atBottom = Math.abs((element.scrollHeight - element.scrollTop) - element.clientHeight) < 1;

    if (atBottom) {
      this.pagination$.pipe(
        tap(pagination => {
          if (pagination.page < pagination.total_pages) {
            this.loadAttributes(pagination.page + 1);
          }
        })
      ).subscribe();
    }
  }

  closeDialogHandler(): void {
    this.closeDialog.emit();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;

      this.store.dispatch(createContact({
        name: formValue.name,
        phone_number: this.formService.getPhoneNumber(formValue),
        attributes: formValue.customAttributes
          .filter((attr: any) => attr.attributeName && attr.value)
          .map((attr: any) => ({
            name: attr.attributeName,
            value: attr.value
          }))
      }));

      this.closeDialogHandler();
    } else {
      this.markFormGroupTouched(this.contactForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    this.closeDialogHandler();
  }
}
