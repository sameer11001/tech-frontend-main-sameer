import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as TemplateActions from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.actions';
import * as ScheduledBroadcastActions from '../../../../../../../../core/services/broadcast/scheduled broadcast/ngrx/scheduled-broadcast.actions';
import {
  selectTemplates,
  selectTemplateError,
} from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.selectors';
import {
  selectPublishLoading,
  selectPublishError,
} from '../../../../../../../../core/services/broadcast/scheduled broadcast/ngrx/scheduled-broadcast.selectors';
import { TemplateResponse, WhatsAppTemplate } from '../../../../../../../../core/models/whatsapp-twmplate.model';
import { BroadcastRequest } from '../../../../../../../../core/models/broadcast.model';
import { ToastService } from '../../../../../../../../core/services/toast-message.service';
import { WhatsAppPreviewComponent } from '../../../whatsapp-preview/whatsapp-preview.component';
import * as ContactActions from '../../../../../../../../core/services/contact/ngrx/contact.actions';
import { selectContacts, selectLoading as selectContactLoading } from '../../../../../../../../core/services/contact/ngrx/contact.selectors';

@Component({
  selector: 'app-new-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, WhatsAppPreviewComponent],
  templateUrl: './new-broadcast.component.html',
  styleUrl: './new-broadcast.component.css'
})
export class NewBroadcastComponent implements OnInit {
  broadcastForm: FormGroup;
  templates$: Observable<TemplateResponse>;
  templateError$: Observable<any>;
  publishLoading$: Observable<boolean>;
  publishError$: Observable<any>;
  contacts$: Observable<any>;
  contactLoading$: Observable<boolean>;
  
  selectedContacts: string[] = [];
  formattedPhoneNumbers: string[] = []; // New property to store formatted phone numbers
  selectedTemplate: WhatsAppTemplate | null = null;
  waHeader: string = '';
  waBody: string = '';
  waFooter: string = '';
  waButtons: any[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.broadcastForm = this.fb.group({
      broadcast_name: ['', Validators.required],
      template_id: ['', Validators.required],
      parameters: [''],
      scheduled_time: [''],
      is_now: [true]
    });

    this.templates$ = this.store.select(selectTemplates);
    this.templateError$ = this.store.select(selectTemplateError);
    this.publishLoading$ = this.store.select(selectPublishLoading);
    this.publishError$ = this.store.select(selectPublishError);
    this.contacts$ = this.store.select(selectContacts);
    this.contactLoading$ = this.store.select(selectContactLoading);
  }

  ngOnInit() {
    this.loadTemplates();
    this.loadContacts();
    this.setupFormListeners();
    this.setupBroadcastListeners();
    this.checkForTemplateFromQueryParams();
  }

  loadTemplates() {
    this.store.dispatch(TemplateActions.loadTemplates({ limit: 50 }));
  }

  loadContacts() {
    this.store.dispatch(ContactActions.getContacts({ page: 1, limit: 100 }));
  }

  setupFormListeners() {
    this.broadcastForm.get('template_id')?.valueChanges.subscribe(templateId => {
      if (templateId) {
        // Wait for templates to be available
        this.templates$.pipe(take(1)).subscribe(templates => {
          this.selectedTemplate = templates?.data?.find(t => t._id === templateId) || null;
          if (this.selectedTemplate) {
            this.extractTemplateComponents();
          } else {
            this.clearTemplateData();
          }
        });
      } else {
        this.clearTemplateData();
      }
    });

    // Also listen for template data changes to handle async loading
    this.templates$.subscribe(templates => {
      const currentTemplateId = this.broadcastForm.get('template_id')?.value;
      if (currentTemplateId && templates?.data) {
        const template = templates.data.find(t => t._id === currentTemplateId);
        if (template && !this.selectedTemplate) {
          this.selectedTemplate = template;
          this.extractTemplateComponents();
        }
      }
    });
  }

  extractTemplateComponents() {
    const comps = this.selectedTemplate?.components || [];
    
    // Extract header text
    const headerComp = comps.find(c => c.type === 'HEADER');
    this.waHeader = headerComp?.text || '';
    
    // Extract body text
    const bodyComp = comps.find(c => c.type === 'BODY');
    this.waBody = bodyComp?.text || '';
    
    // Extract footer text
    const footerComp = comps.find(c => c.type === 'FOOTER');
    this.waFooter = footerComp?.text || '';
    
    // Extract buttons and map them to the correct format
    const buttonsComp = comps.find(c => c.type === 'BUTTONS');
    if (buttonsComp?.buttons) {
      this.waButtons = buttonsComp.buttons.map(btn => ({
        type: btn.type === 'PHONE' ? 'PHONE_NUMBER' : btn.type,
        text: btn.text || ''
      }));
    } else {
      this.waButtons = [];
    }
  }

  clearTemplateData() {
    this.selectedTemplate = null;
    this.waHeader = '';
    this.waBody = '';
    this.waFooter = '';
    this.waButtons = [];
  }

  onContactToggle(phone: string, contact?: any) {
    const index = this.selectedContacts.indexOf(phone);
    if (index > -1) {
      this.selectedContacts.splice(index, 1);
      this.formattedPhoneNumbers.splice(index, 1);
    } else {
      this.selectedContacts.push(phone);
      // Use contact data if available for better formatting
      if (contact) {
        this.formattedPhoneNumbers.push(this.formatPhoneNumberWithCountryCode(contact));
      } else {
        this.formattedPhoneNumbers.push(this.formatPhoneNumber(phone));
      }
    }
  }

  /**
   * Format phone number to include country code if not present
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters except +
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // If phone number already starts with +, return as is
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    // If phone number starts with country code without +, add +
    if (cleanPhone.match(/^[1-9]\d{0,3}/)) {
      return `+${cleanPhone}`;
    }
    
    // Default: return as is (assuming it's already formatted)
    return cleanPhone;
  }

  /**
   * Format phone number with country code from contact data
   */
  private formatPhoneNumberWithCountryCode(contact: any): string {
    if (contact.country_code && contact.phone_number) {
      // Clean the country code and phone number
      const cleanCountryCode = contact.country_code.replace(/[^\d]/g, '');
      const cleanPhoneNumber = contact.phone_number.replace(/[^\d]/g, '');
      
      // Combine them with + prefix
      return `+${cleanCountryCode}${cleanPhoneNumber}`;
    }
    return this.formatPhoneNumber(contact.phone_number || '');
  }

  /**
   * Validate and format phone number for broadcast
   */
  private validateAndFormatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits including country code)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      console.warn(`Invalid phone number length: ${phone}`);
    }
    
    // Add + prefix
    return `+${digitsOnly}`;
  }

  /**
   * Handle bulk selection of all contacts
   */
  onSelectAllContacts(checked: boolean): void {
    this.contacts$.pipe(take(1)).subscribe(contacts => {
      if (checked) {
        // Select all contacts
        contacts?.forEach((contact: any) => {
          if (!this.selectedContacts.includes(contact.phone_number)) {
            this.selectedContacts.push(contact.phone_number);
            this.formattedPhoneNumbers.push(this.formatPhoneNumberWithCountryCode(contact));
          }
        });
      } else {
        // Deselect all contacts
        this.selectedContacts = [];
        this.formattedPhoneNumbers = [];
      }
    });
  }

  /**
   * Handle select all checkbox event
   */
  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onSelectAllContacts(target.checked);
  }

  /**
   * Get all selected phone numbers as formatted strings for API
   */
  getSelectedPhoneNumbersForAPI(): string[] {
    return this.formattedPhoneNumbers.map(phone => this.validateAndFormatPhoneNumber(phone));
  }

  /**
   * Get all selected phone numbers as formatted strings for display
   */
  getSelectedPhoneNumbersAsStrings(): string[] {
    return this.formattedPhoneNumbers;
  }

  /**
   * Get selected phone numbers as a single string (comma-separated)
   */
  getSelectedPhoneNumbersAsString(): string {
    return this.formattedPhoneNumbers.join(', ');
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.showToast('Phone numbers copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.toastService.showToast('Phone numbers copied to clipboard!', 'success');
    });
  }

  onScheduleChange(isNow: boolean) {
    this.broadcastForm.patchValue({ is_now: isNow });
    if (!isNow) {
      this.broadcastForm.get('scheduled_time')?.setValidators([Validators.required]);
    } else {
      this.broadcastForm.get('scheduled_time')?.clearValidators();
      // Clear scheduled time when switching to "now"
      this.broadcastForm.patchValue({ scheduled_time: '' });
    }
    this.broadcastForm.get('scheduled_time')?.updateValueAndValidity();
  }

  onAddBroadcast() {
    if (this.broadcastForm.valid && this.selectedContacts.length > 0) {
      const formValue = this.broadcastForm.value;
      // Get the formatted phone numbers for API
      const apiPhoneNumbers = this.getSelectedPhoneNumbersForAPI();
      // Log the phone numbers being sent (for debugging)
      console.log('Phone numbers being sent to API:', apiPhoneNumbers);
      console.log('Total phone numbers:', apiPhoneNumbers.length);
      
      // Determine if this is a scheduled broadcast or immediate broadcast
      const isScheduled = formValue.scheduled_time && !formValue.is_now;
      const scheduledTime = isScheduled ? new Date(formValue.scheduled_time).toISOString() : new Date().toISOString();
      
      const broadcastData: BroadcastRequest = {
        broadcast_name: formValue.broadcast_name,
        list_of_numbers: apiPhoneNumbers, // Use formatted phone numbers with country codes
        template_id: formValue.template_id, // This will be the _id from the form
        parameters: formValue.parameters ? [formValue.parameters] : [],
        scheduled_time: scheduledTime,
        is_now: !isScheduled // Set to false if scheduled, true if immediate
      };
      console.log('Broadcast data being sent:', broadcastData);
      this.store.dispatch(ScheduledBroadcastActions.publishBroadcast({ broadcastData }));
    } else {
      this.toastService.showToast('Please fill all required fields and select at least one contact', 'error');
    }
  }

  setupBroadcastListeners() {
    this.publishError$.subscribe(error => {
      if (error) {
        this.toastService.showToast('Failed to publish broadcast', 'error');
      }
    });
  }

  checkForTemplateFromQueryParams() {
    this.route.queryParams.subscribe(params => {
      const templateId = params['templateId'];
      const templateName = params['templateName'];
      
      if (templateId) {
        // Set the template ID in the form
        this.broadcastForm.patchValue({
          template_id: templateId,
          broadcast_name: templateName ? `${templateName}_broadcast` : 'New Broadcast'
        });
        
        // Wait for templates to be loaded and then find the template
        this.templates$.subscribe(templates => {
          if (templates?.data && !this.selectedTemplate) {
            const template = templates.data.find(t => t._id === templateId);
            if (template) {
              this.selectedTemplate = template;
              this.extractTemplateComponents();
            }
          }
        });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/dashboard/broadcast/scheduled-broadcasts']);
  }

  /**
   * Navigate to New Template Component
   */
  onAddNewTemplate() {
    this.router.navigate(['/dashboard/broadcast/your-templates/new-template']);
  }
}
