import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import * as TemplateActions from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.actions';
import { Observable } from 'rxjs';
import {
  selectCreateNewTemplate,
  selectNewTemplateError,
  selectMediaIds,
} from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.selectors';
import { Actions, ofType } from '@ngrx/effects';
import {
  WhatsAppButton,
  WhatsAppPreviewComponent,
} from '../../../whatsapp-preview/whatsapp-preview.component';
import { AuthService } from '../../../../../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../../../../../core/services/toast-message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplateFacadeService } from './services/template-facade.service';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { SuccessMessageComponent } from './components/success-message/success-message.component';
import { TemplateInfoSectionComponent } from './components/template-info-section/template-info-section.component';
import { MediaUploadSectionComponent } from './components/media-upload-section/media-upload-section.component';
import { BodyFooterSectionComponent } from './components/body-footer-section/body-footer-section.component';
import { ButtonsSectionComponent } from './components/buttons-section/buttons-section.component';
import { FormActionsSectionComponent } from './components/form-actions-section/form-actions-section.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WhatsAppPreviewComponent,
    TemplateInfoSectionComponent,
    MediaUploadSectionComponent,
    BodyFooterSectionComponent,
    ButtonsSectionComponent,
    FormActionsSectionComponent,
    SuccessMessageComponent,
    LoadingOverlayComponent
],
  selector: 'app-new-template',
  templateUrl: './new-template-message.component.html',
})
export class NewTemplateComponent implements OnInit, OnDestroy {
  templateForm!: FormGroup;

  // These will be populated from services
  categories: string[] = [];
  languages: [string, string][] = [];
  broadcastOptions: string[] = [];
  buttonTypes: string[] = [];

  // Media state - managed by services
  selectedMedia: { [key: string]: File | null } = {
    image: null,
    video: null,
    document: null,
  };
  mediaPreviewUrls: { [key: string]: string | null } = {
    image: null,
    video: null,
    document: null,
  };

  // Button state - managed by services
  showButton: boolean = false;
  visitWebsiteButton: boolean = false;
  callPhoneButton: boolean = false;
  copyOfferButton: boolean = false;
  quickReplyButton: number = 0;
  marketingButtonRequired: boolean = false;

  // Loading and success states
  isLoading: boolean = false;
  showSuccess: boolean = false;

  // NgRx observables
  loading$: Observable<boolean>;
  error$: Observable<any>;
  mediaIds$: Observable<{ [key: string]: string }>;
  mediaIds: { [key: string]: string } = {};

  // Computed properties - delegate to services
  get previewButtons(): WhatsAppButton[] {
    return this.templateFacade.previewButtons;
  }

  get previewMediaUrl(): string {
    return this.templateFacade.previewMediaUrl;
  }

  get previewMediaType(): 'image' | 'video' | 'document' | '' {
    return this.templateFacade.previewMediaType;
  }

  get isAuthenticationCategory(): boolean {
    return this.templateFacade.isAuthenticationCategory;
  }

  get shouldShowButtonSection(): boolean {
    return this.templateFacade.shouldShowButtonSection;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private templateFacade: TemplateFacadeService
  ) {
    this.loading$ = this.store.select(selectCreateNewTemplate);
    this.error$ = this.store.select(selectNewTemplateError);
    this.mediaIds$ = this.store.select(selectMediaIds);

    // Listen for successful template creation
    this.actions$
      .pipe(ofType(TemplateActions.createTemplateSuccess))
      .subscribe(() => {
        console.log('Template created successfully!');
        this.isLoading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false;
          this.resetForm();
          this.cdr.detectChanges();
        }, 3000);
      });

    // Listen for template creation failure
    this.actions$
      .pipe(ofType(TemplateActions.createTemplateFailure))
      .subscribe(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    // Initialize from services
    this.categories = [...this.templateFacade.categories];
    this.languages = this.templateFacade.languages;
    this.broadcastOptions = [...this.templateFacade.broadcastOptions];
    this.buttonTypes = [...this.templateFacade.buttonTypes];

    // Create form using service
    this.templateForm = this.templateFacade.createForm();

    // Prefill logic for copy-template
    const prefill = history.state?.prefill;
    console.log('Prefill received:', prefill);
    if (prefill) {
      this.templateFacade.patchFormWithTemplate(prefill);
      this.updateLocalState();
      this.cdr.detectChanges();
    }

    // Subscribe to loading and error states
    this.loading$.subscribe((loading) => {
      console.log('Template creation loading:', loading);
      this.isLoading = loading;
      this.cdr.detectChanges();
    });

    this.error$.subscribe((error) => {
      if (error) {
        console.error('Template creation error:', error);
        this.toastService.showToast(
          `Template creation failed: ${error.message || error}`,
          'error'
        );
      }
    });

    // Subscribe to media IDs
    this.mediaIds$.subscribe((mediaIds) => {
      this.mediaIds = mediaIds;
      console.log('Current media IDs:', mediaIds);
    });

    // Subscribe to form value changes to update preview in real-time
    this.templateForm.valueChanges.subscribe(() => {
      console.log('Form values changed, updating preview...');
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    // Clean up object URLs to prevent memory leaks
    this.templateFacade.clearPreviousMedia();
  }

  // File management
  clearFile(): void {
    this.templateFacade.clearPreviousMedia();
    this.updateLocalState();
  }

  resetForm(): void {
    this.templateFacade.resetForm();
    this.templateForm = this.templateFacade.getForm();
    this.updateLocalState();
  }

  // Button management
  onAddButton(buttonType: string) {
    this.templateFacade.toggleButton(buttonType, this.templateForm);
    this.updateLocalState();
    console.log('Button state updated, preview will refresh');
    this.cdr.detectChanges();
  }

  onDeleteQuickReplyButton(index: number) {
    this.templateFacade.removeQuickReplyButton(index, this.templateForm);
    this.updateLocalState();
    console.log('Quick reply button removed, preview will refresh');
    this.cdr.detectChanges();
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.showButton = target.checked;
  }

  // Broadcast title changes
  onBroadcastTitleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    console.log('=== Broadcast Title Change ===');
    console.log('New broadcast title:', value);

    // Clear media when switching to None, Text, or when switching between different media types
    if (value === 'None' || value === 'Text') {
      console.log('Clearing media due to broadcast title change to:', value);
      this.templateFacade.clearPreviousMedia();
    } else if (value === 'Image' || value === 'Video' || value === 'Document') {
      // Check if we're switching from one media type to another
      const currentMediaType = this.previewMediaType;
      const newMediaType = value.toLowerCase() as
        | 'image'
        | 'video'
        | 'document';

      if (currentMediaType && currentMediaType !== newMediaType) {
        console.log(
          `Clearing media due to switch from ${currentMediaType} to ${newMediaType}`
        );
        this.templateFacade.clearPreviousMedia();
      }
    }

    this.updateLocalState();
    this.cdr.detectChanges();
  }

  // Media selection
  onMediaSelected(event: Event, mediaType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Use the media manager service to handle file selection
      this.templateFacade.selectMedia(file, mediaType);
      this.updateLocalState();

      // Update broadcast title to match the selected media type
      this.templateFacade.updateBroadcastTitleForMedia(mediaType);

      console.log(`Selected media updated:`, this.selectedMedia);
      console.log(`Media preview URLs:`, this.mediaPreviewUrls);
      console.log(
        `Broadcast title:`,
        this.templateForm.get('broadcastTitle')?.value
      );
      console.log(`Preview media URL:`, this.previewMediaUrl);
      console.log(`=== End Media Selection Debug ===`);

      this.cdr.detectChanges();

      console.log(`Media selected for ${mediaType}:`, file.name);
      console.log('Preview updated immediately');
    }
  }

  // Variable management
  onAddVariableToBody() {
    this.templateFacade.addVariableToBody();
  }

  // Form submission
  onSubmit() {
    if (this.isAuthenticationCategory) {
      this.toastService.showToast(
        'Buttons are disabled and submission is not allowed for AUTHENTICATION category.',
        'error'
      );
      return;
    }

    // Enforce button requirement for Marketing
    if (
      this.templateForm.get('category')?.value?.toUpperCase() === 'MARKETING' &&
      !this.templateFacade.hasAtLeastOneButton()
    ) {
      this.marketingButtonRequired = true;
      this.toastService.showToast(
        'At least one button is required for Marketing templates.',
        'error'
      );
      return;
    } else {
      this.marketingButtonRequired = false;
    }

    if (this.templateForm.valid) {
      // Set loading state
      this.isLoading = true;
      this.cdr.detectChanges();

      // Use the submission service to handle template creation
      this.templateFacade.submitTemplate(this.mediaIds).then((result) => {
        if (result.success) {
          console.log('Template created successfully!');
          // Success state will be handled by the action listener
        } else {
          console.error('Template creation failed:', result.error);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('Form is invalid.');
      console.log('Form validation errors:', this.getFormValidationErrors());
    }
  }

  // Template patching
  patchFormWithTemplate(template: any) {
    this.templateFacade.patchFormWithTemplate(template);
    this.updateLocalState();
    this.cdr.detectChanges();
  }

  mapButtonsToForm(buttons: any[]) {
    const buttonState =
      this.templateFacade.templateBuilderService.mapButtonsFromTemplate(
        buttons
      );
    this.templateFacade.applyButtonState(buttonState);
    this.updateLocalState();
  }

  // Helper methods
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.templateForm.controls).forEach((key) => {
      const control = this.templateForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private updateLocalState(): void {
    // Update local state from services
    this.selectedMedia = this.templateFacade.selectedMedia;
    this.mediaPreviewUrls = this.templateFacade.mediaPreviewUrls;
    this.showButton = this.templateFacade.showButton;
    this.visitWebsiteButton = this.templateFacade.visitWebsiteButton;
    this.callPhoneButton = this.templateFacade.callPhoneButton;
    this.copyOfferButton = this.templateFacade.copyOfferButton;
    this.quickReplyButton = this.templateFacade.quickReplyButton;
    this.marketingButtonRequired = this.templateFacade.marketingButtonRequired;
  }
}
