import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as TemplateActions from '../../../../../../../../../core/services/broadcast/template/ngrx/your-template.actions';
import { TemplateFormData } from './template-form.service';
import { ButtonState } from './button-manager.service';
import { MediaManagerService } from './media-manager.service';
import { TemplateBuilderService } from './template-builder.service';
import { TemplateValidationService, ValidationResult } from './template-validation.service';
import { ToastService } from '../../../../../../../../../core/services/toast-message.service';
import { selectCreateNewTemplate, selectNewTemplateError, selectMediaIds } from '../../../../../../../../../core/services/broadcast/template/ngrx/your-template.selectors';

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateSubmissionService {

  constructor(
    private store: Store,
    private actions$: Actions,
    private toastService: ToastService,
    private mediaManager: MediaManagerService,
    private templateBuilder: TemplateBuilderService,
    private validationService: TemplateValidationService
  ) {}

  async submitTemplate(
    formData: TemplateFormData,
    buttonState: ButtonState,
    mediaIds: { [key: string]: string }
  ): Promise<SubmissionResult> {
    // Validate submission
    const validation = this.validationService.validateTemplateSubmission(formData, buttonState);
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(' ');
      this.toastService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }

    // Check if media upload is needed
    const needsMediaUpload = this.mediaManager.hasMediaForType(formData.broadcastTitle);

    if (needsMediaUpload) {
      return this.uploadMediaAndCreateTemplate(formData, buttonState, mediaIds);
    } else {
      return this.createTemplateDirectly(formData, buttonState, mediaIds);
    }
  }

  private async uploadMediaAndCreateTemplate(
    formData: TemplateFormData,
    buttonState: ButtonState,
    mediaIds: { [key: string]: string }
  ): Promise<SubmissionResult> {
    const mediaType = formData.broadcastTitle.toLowerCase();
    const file = this.mediaManager.getSelectedMedia(mediaType);
    
    if (!file) {
      const errorMessage = `Please select a ${mediaType} file first.`;
      this.toastService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }

    try {
      // Upload media first and get the new media ID
      const newMediaId = await this.uploadMedia(mediaType, file);
      
      // Create updated mediaIds with the new media ID
      const updatedMediaIds = { ...mediaIds };
      updatedMediaIds[mediaType] = newMediaId;
      
      // Then create template with updated media IDs
      return this.createTemplateDirectly(formData, buttonState, updatedMediaIds);
    } catch (error) {
      const errorMessage = 'Media upload failed. Please try again.';
      this.toastService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }

  private async uploadMedia(mediaType: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('media_type', mediaType);

    this.store.dispatch(
      TemplateActions.uploadMedia({ file: formData, mediaType: mediaType })
    );

    // Wait for upload success or failure and return the media ID
    return new Promise((resolve, reject) => {
      this.actions$.pipe(
        ofType(TemplateActions.uploadMediaSuccess, TemplateActions.uploadMediaFailure),
        take(1)
      ).subscribe(action => {
        if (action.type === TemplateActions.uploadMediaSuccess.type) {
          // Extract media ID from response.data.h
          const mediaId = action.response?.data?.h;
          if (mediaId) {
            console.log('Media upload successful, media ID:', mediaId);
            resolve(mediaId);
          } else {
            console.error('Media upload succeeded but no media ID in response.data.h:', action.response);
            reject(new Error('Media upload succeeded but no media ID returned'));
          }
        } else {
          console.error('Media upload failed:', action.error);
          reject(new Error('Media upload failed'));
        }
      });
    });
  }

  private async createTemplateDirectly(
    formData: TemplateFormData,
    buttonState: ButtonState,
    mediaIds: { [key: string]: string }
  ): Promise<SubmissionResult> {
    try {
      const request = this.templateBuilder.buildTemplateRequest(formData, buttonState, mediaIds);
      
      console.log('=== NEW TEMPLATE REQUEST BODY ===');
      console.log('Request:', JSON.stringify(request, null, 2));
      console.log('Form Data:', formData);
      console.log('Button State:', buttonState);
      console.log('Media IDs:', mediaIds);
      console.log('=== END REQUEST BODY ===');

      // Validate request structure
      this.validateRequestStructure(request);

      this.store.dispatch(TemplateActions.createTemplate({ request }));

      // Wait for creation success or failure
      return new Promise((resolve) => {
        this.actions$.pipe(
          ofType(TemplateActions.createTemplateSuccess, TemplateActions.createTemplateFailure),
          take(1)
        ).subscribe(action => {
          if (action.type === TemplateActions.createTemplateSuccess.type) {
            this.toastService.showToast('Template created successfully!', 'success');
            resolve({ success: true });
          } else {
            console.error('Template creation failed:', action.error);
            const errorMessage = `Template creation failed: ${action.error?.message || action.error}`;
            this.toastService.showToast(errorMessage, 'error');
            resolve({ success: false, error: errorMessage });
          }
        });
      });
    } catch (error) {
      console.error('Template creation error:', error);
      const errorMessage = 'Template creation failed. Please try again.';
      this.toastService.showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }

  private validateRequestStructure(request: any): void {
    console.log('=== VALIDATING REQUEST STRUCTURE ===');
    // Check required fields
    if (!request.name) {
      console.error('❌ Missing template name');
    }
    if (!request.category) {
      console.error('❌ Missing category');
    }
    if (!request.language) {
      console.error('❌ Missing language');
    }
    if (!request.body) {
      console.error('❌ Missing body');
    }

    // Validate body
    if (request.body && !request.body.text) {
      console.error('❌ Body missing text');
    }

    // Validate header if present
    if (request.header) {
      if (!request.header.format) {
        console.error('❌ Header missing format');
      }
      if (request.header.format === 'TEXT' && !request.header.text) {
        console.error('❌ Text header missing text');
      }
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(request.header.format) && !request.header.media_handle) {
        console.error(`❌ ${request.header.format} header missing media_handle`);
      }
    }

    // Validate buttons if present
    if (request.buttons && Array.isArray(request.buttons)) {
      request.buttons.forEach((button: any, index: number) => {
        if (!button.type) {
          console.error(`❌ Button ${index} missing type`);
        }
        if (!button.text) {
          console.error(`❌ Button ${index} missing text`);
        }
        if (button.type === 'URL' && !button.url) {
          console.error(`❌ URL button ${index} missing url`);
        }
      });
    }
    
    console.log('=== END VALIDATION ===');
  }

  getSubmissionObservables() {
    return {
      loading$: this.store.select(selectCreateNewTemplate),
      error$: this.store.select(selectNewTemplateError),
      mediaIds$: this.store.select(selectMediaIds)
    };
  }
} 