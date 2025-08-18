import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { getContacts } from '../../../../../../../../../core/services/contact/ngrx/contact.actions';
import { FormValidationUtils } from '../../../../../../../../../utils/form-validation.utils';
import { countries } from '../../../../../../../../../utils/countries';
import { selectContacts, selectLoading, selectPagination } from '../../../../../../../../../core/services/contact/ngrx/contact.selectors';
import { YourTemplateService } from '../../../../../../../../../core/services/broadcast/template/your-template.service';
import { ConversationsService } from '../../../../../../../../../core/services/conversations/conversations.service';
import { WhatsAppTemplate } from '../../../../../../../../../core/models/whatsapp-twmplate.model';

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
  
  // Template related properties
  templates: WhatsAppTemplate[] = [];
  templatesLoading = false;
  showTemplatesDropdown = false;
  selectedTemplate: WhatsAppTemplate | null = null;
  templateParameters: string[] = [];

  
  // Mode selection
  inputMode: 'contact' | 'phone' = 'contact';

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private templateService: YourTemplateService,
    private conversationsService: ConversationsService,
    private dialogRef: MatDialogRef<NewChatDialogComponent>,
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit() {
    this.loadContacts(1);
    this.loadTemplates();
    
    // Set initial validation
    this.contactForm.get('templateId')?.setValidators(Validators.required);
    this.contactForm.get('selectedContactId')?.setValidators(Validators.required);
    this.contactForm.updateValueAndValidity();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Contact selection mode
      selectedContactId: [''],
      selectedContactName: [''],
      selectedContactPhone: [''],
      selectedContactCountryId: [''],
      
      // Phone number input mode
      countryCode: [''],
      phoneNumber: [''],
      
      // Template selection
      templateId: [''],
      parameters: this.fb.array([])
    });
  }

  private loadContacts(page: number) {
    this.store.dispatch(getContacts({ page, limit: 10 }));
  }

  private loadTemplates() {
    this.templatesLoading = true;
    console.log('Loading templates...');
    console.log('Template service:', this.templateService);
    
    this.templateService.getTemplates(1, 50).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Template loading timeout or error:', error);
        return of(null); // Return null to trigger error handling
      })
    ).subscribe({
              next: (response: any) => {
          if (response === null) {
            // Handle timeout/error case
            console.log('Response is null, using mock templates');
            this.templates = [
              {
                _id: 'mock-1',
                name: 'Welcome Message',
                language: 'en',
                status: 'APPROVED' as any,
                category: 'UTILITY',
                components: [
                  {
                    type: 'BODY',
                    text: 'Hello {{1}}, welcome to our service! Your account {{2}} has been created successfully.'
                  }
                ]
              },
              {
                _id: 'mock-2',
                name: 'Order Confirmation',
                language: 'en',
                status: 'APPROVED' as any,
                category: 'MARKETING',
                components: [
                  {
                    type: 'BODY',
                    text: 'Thank you for your order {{1}}! Your order number is {{2}} and will be delivered on {{3}}.'
                  }
                ]
              },
              {
                _id: 'mock-3',
                name: 'Appointment Reminder',
                language: 'en',
                status: 'APPROVED' as any,
                category: 'UTILITY',
                components: [
                  {
                    type: 'BODY',
                    text: 'Reminder: You have an appointment with {{1}} on {{2}} at {{3}}.'
                  }
                ]
              }
            ];
            this.templatesLoading = false;
            return;
          }
          
          console.log('Templates response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response || {}));
          
          // Handle the correct response structure
          if (response.data && response.data.templates && response.data.templates.data) {
            console.log('Using response.data.templates.data');
            this.templates = response.data.templates.data;
          } else if (response.templates && response.templates.data) {
            console.log('Using response.templates.data');
            this.templates = response.templates.data;
          } else if (response.templates) {
            console.log('Using response.templates');
            this.templates = response.templates;
          } else if (response.data && Array.isArray(response.data)) {
            console.log('Using response.data as array');
            this.templates = response.data;
          } else {
            console.log('No templates found in response');
            this.templates = [];
          }
          console.log('Templates loaded:', this.templates);
          console.log('Templates length:', this.templates.length);
          this.templatesLoading = false;
        },
      error: (error: any) => {
        console.error('Error loading templates:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        
        // For testing purposes, let's add some mock templates
        console.log('Adding mock templates for testing...');
        this.templates = [
          {
            _id: 'mock-1',
            name: 'Welcome Message',
            language: 'en',
            status: 'APPROVED' as any,
            category: 'UTILITY',
            components: [
              {
                type: 'BODY',
                text: 'Hello {{1}}, welcome to our service! Your account {{2}} has been created successfully.'
              }
            ]
          },
          {
            _id: 'mock-2',
            name: 'Order Confirmation',
            language: 'en',
            status: 'APPROVED' as any,
            category: 'MARKETING',
            components: [
              {
                type: 'BODY',
                text: 'Thank you for your order {{1}}! Your order number is {{2}} and will be delivered on {{3}}.'
              }
            ]
          },
          {
            _id: 'mock-3',
            name: 'Appointment Reminder',
            language: 'en',
            status: 'APPROVED' as any,
            category: 'UTILITY',
            components: [
              {
                type: 'BODY',
                text: 'Reminder: You have an appointment with {{1}} on {{2}} at {{3}}.'
              }
            ]
          }
        ];
        
        this.templatesLoading = false;
      }
    });
  }

  // Mode switching
  setInputMode(mode: 'contact' | 'phone') {
    this.inputMode = mode;
    
    if (mode === 'contact') {
      this.contactForm.patchValue({
        countryCode: '',
        phoneNumber: ''
      });
      this.contactForm.get('countryCode')?.clearValidators();
      this.contactForm.get('phoneNumber')?.clearValidators();
      this.contactForm.get('selectedContactId')?.setValidators(Validators.required);
    } else {
      this.contactForm.patchValue({
        selectedContactId: '',
        selectedContactName: '',
        selectedContactPhone: ''
      });
      this.contactForm.get('selectedContactId')?.clearValidators();
      this.contactForm.get('countryCode')?.setValidators(Validators.required);
      this.contactForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern(/^[\d\s\(\)\-\+]+$/)]);
    }
    
    // Always require template selection
    this.contactForm.get('templateId')?.setValidators(Validators.required);
    this.contactForm.updateValueAndValidity();
  }

  // Contact selection
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
      selectedContactId: contact.id,
      selectedContactName: contact.name,
      selectedContactPhone: contact.phone_number,
      selectedContactCountryId: contact.country_code || null
    });
    this.showContactsDropdown = false;
  }

  // Template selection
  toggleTemplatesDropdown() {
    console.log('Toggling templates dropdown, current state:', this.showTemplatesDropdown);
    console.log('Available templates:', this.templates);
    this.showTemplatesDropdown = !this.showTemplatesDropdown;
  }

  selectTemplate(template: WhatsAppTemplate) {
    console.log('Selecting template:', template);
    this.selectedTemplate = template;
    this.contactForm.patchValue({
      templateId: template._id || template.id
    });
    
    // Extract parameters from template components
    this.templateParameters = this.extractTemplateParameters(template);
    

    
    this.showTemplatesDropdown = false;
  }

  private extractTemplateParameters(template: WhatsAppTemplate): string[] {
    const parameters: string[] = [];
    
    template.components.forEach(component => {
      if (component.text) {
        // Simple parameter extraction - look for {{1}}, {{2}}, etc.
        const matches = component.text.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach(match => {
            const paramIndex = match.match(/\d+/)?.[0];
            if (paramIndex) {
              const index = parseInt(paramIndex) - 1;
              if (!parameters[index]) {
                parameters[index] = '';
              }
            }
          });
        }
      }
    });
    
    return parameters;
  }

  updateParameter(index: number, value: string) {
    this.templateParameters[index] = value;
  }



  getTemplatePreview(template: WhatsAppTemplate): string {
    const text = template.components[0]?.text;
    if (!text) return '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.dialogRef.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.template-dropdown-container') && !target.closest('.contact-dropdown-container')) {
      this.showTemplatesDropdown = false;
      this.showContactsDropdown = false;
    }
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;
      
      // Prepare the request payload
      const payload: any = {
        template_id: formValue.templateId,
        parameters: this.templateParameters.filter(p => p && p.trim() !== '')
      };



             // Set contact phone number with country code included
       if (this.inputMode === 'contact') {
         // For existing contacts, use the phone number as is (should already include country code)
         payload.contact_phone_number = formValue.selectedContactPhone;
       } else {
         // For new phone numbers, concatenate country code with phone number
         const countryCode = formValue.countryCode;
         const phoneNumber = formValue.phoneNumber.replace(/\D/g, '');
         payload.contact_phone_number = `${countryCode}${phoneNumber}`;
       }

      console.log('Sending payload:', payload);
                     console.log('Payload details:', {
          contact_phone_number: payload.contact_phone_number,
          template_id: payload.template_id,
          parameters: payload.parameters
        });

      // Call the API
      this.conversationsService.createConversation(payload).subscribe({
        next: (response: any) => {
          console.log('Conversation created successfully:', response);
          this.dialogRef.close(response);
        },
        error: (error: any) => {
          console.error('Error creating conversation:', error);
          // Handle error - you might want to show a toast message here
        }
      });
    } else {
      Object.values(this.contactForm.controls).forEach(c => c.markAsTouched());
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
