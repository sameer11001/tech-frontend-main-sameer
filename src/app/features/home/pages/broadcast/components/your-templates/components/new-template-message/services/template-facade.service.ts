import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateFormService, TemplateFormData } from './template-form.service';
import { ButtonManagerService, ButtonState } from './button-manager.service';
import { MediaManagerService } from './media-manager.service';
import { TemplateBuilderService } from './template-builder.service';
import { TemplateValidationService } from './template-validation.service';
import { TemplateSubmissionService, SubmissionResult } from './template-submission.service';
import { TemplateConstants } from './template-constants.service';
import { TemplateLanguageConstant } from '../../../../../../../../../core/utils/TemplateLanguageConstant';
import { FormArray } from '@angular/forms';

export interface TemplateState {
  formData: TemplateFormData;
  buttonState: ButtonState;
  mediaState: {
    selectedMedia: { [key: string]: File | null };
    mediaPreviewUrls: { [key: string]: string | null };
  };
  isAuthenticationCategory: boolean;
  shouldShowButtonSection: boolean;
  previewButtons: any[];
  previewMediaUrl: string;
  previewMediaType: 'image' | 'video' | 'document' | '';
}

@Injectable({
  providedIn: 'root'
})
export class TemplateFacadeService {

  constructor(
    private templateFormService: TemplateFormService,
    private buttonManager: ButtonManagerService,
    private mediaManager: MediaManagerService,
    private templateBuilder: TemplateBuilderService,
    private validationService: TemplateValidationService,
    private submissionService: TemplateSubmissionService
  ) {}

  // Form management
  createForm() {
    return this.templateFormService.createForm();
  }

  getForm() {
    return this.templateFormService.getForm();
  }

  resetForm() {
    this.templateFormService.resetForm();
    this.buttonManager.resetButtons(this.templateFormService.getForm());
    this.mediaManager.clearPreviousMedia();
  }

  patchForm(data: Partial<TemplateFormData>) {
    this.templateFormService.patchForm(data);
  }

  // Button management
  toggleButton(buttonType: string, form?: any) {
    this.buttonManager.toggleButton(buttonType, form || this.templateFormService.getForm());
  }

  removeQuickReplyButton(index: number, form?: any) {
    this.buttonManager.removeQuickReplyButton(index, form || this.templateFormService.getForm());
  }

  updateButtonState(newState: Partial<ButtonState>) {
    this.buttonManager.updateState(newState);
  }

  handleCategoryChange(category: string) {
    this.buttonManager.handleCategoryChange(category);
  }

  // Media management
  selectMedia(file: File, mediaType: string) {
    this.mediaManager.selectMedia(file, mediaType);
  }

  clearPreviousMedia() {
    this.mediaManager.clearPreviousMedia();
  }

  updateBroadcastTitleForMedia(mediaType: string) {
    const mediaTypeTitle = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
    this.templateFormService.getForm().patchValue({ broadcastTitle: mediaTypeTitle });
  }

  // Template operations
  async submitTemplate(mediaIds: { [key: string]: string }): Promise<SubmissionResult> {
    const formData = this.templateFormService.getFormValue();
    const buttonState = this.buttonManager.getState();
    return this.submissionService.submitTemplate(formData, buttonState, mediaIds);
  }

  patchFormWithTemplate(template: any) {
    const formData = this.templateBuilder.buildTemplateFromExisting(template);
    this.templateFormService.patchForm(formData);
    this.buttonManager.resetButtons(this.templateFormService.getForm());

    // Handle buttons if present
    if (template.components) {
      for (const comp of template.components) {
        if (comp.buttons && Array.isArray(comp.buttons)) {
          const buttonState = this.templateBuilder.mapButtonsFromTemplate(comp.buttons);
          this.applyButtonState(buttonState);
        }
      }
    }

    // Mark all controls as touched
    const form = this.templateFormService.getForm();
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  // Getters for template state
  getTemplateState(): TemplateState {
    const form = this.templateFormService.getForm();
    const formData = this.templateFormService.getFormValue();
    const buttonState = this.buttonManager.getState();
    const mediaState = this.mediaManager.getState();

    return {
      formData,
      buttonState,
      mediaState,
      isAuthenticationCategory: this.checkIsAuthenticationCategory(formData.category),
      shouldShowButtonSection: this.checkShouldShowButtonSection(formData.category),
      previewButtons: this.buttonManager.generatePreviewButtons(form),
      previewMediaUrl: this.mediaManager.getPreviewMediaUrl(formData.broadcastTitle),
      previewMediaType: this.mediaManager.getPreviewMediaType(formData.broadcastTitle)
    };
  }

  // Helper methods for category checks
  private checkIsAuthenticationCategory(category: string): boolean {
    return category?.toUpperCase() === TemplateConstants.CATEGORY_TYPES.AUTHENTICATION;
  }

  private checkShouldShowButtonSection(category: string): boolean {
    return category?.toUpperCase() !== TemplateConstants.CATEGORY_TYPES.AUTHENTICATION;
  }

  // Computed properties
  get isAuthenticationCategory(): boolean {
    const formData = this.templateFormService.getFormValue();
    return this.checkIsAuthenticationCategory(formData.category);
  }

  get shouldShowButtonSection(): boolean {
    const formData = this.templateFormService.getFormValue();
    return this.checkShouldShowButtonSection(formData.category);
  }

  get previewButtons() {
    return this.buttonManager.generatePreviewButtons(this.templateFormService.getForm());
  }

  get previewMediaUrl(): string {
    const formData = this.templateFormService.getFormValue();
    return this.mediaManager.getPreviewMediaUrl(formData.broadcastTitle);
  }

  get previewMediaType(): 'image' | 'video' | 'document' | '' {
    const formData = this.templateFormService.getFormValue();
    return this.mediaManager.getPreviewMediaType(formData.broadcastTitle);
  }

  // Service state getters
  get selectedMedia() {
    return this.mediaManager.getState().selectedMedia;
  }

  get mediaPreviewUrls() {
    return this.mediaManager.getState().mediaPreviewUrls;
  }

  get showButton() {
    return this.buttonManager.getState().showButton;
  }

  get visitWebsiteButton() {
    return this.buttonManager.getState().visitWebsiteButton;
  }

  get callPhoneButton() {
    return this.buttonManager.getState().callPhoneButton;
  }

  get copyOfferButton() {
    return this.buttonManager.getState().copyOfferButton;
  }

  get quickReplyButton() {
    return this.buttonManager.getState().quickReplyButton;
  }

  get marketingButtonRequired() {
    return this.buttonManager.getState().marketingButtonRequired;
  }

  get quickReplyTexts() {
    return this.templateFormService.quickReplyTexts;
  }

  get templateBuilderService() {
    return this.templateBuilder;
  }

  // Constants
  get categories() {
    return TemplateConstants.CATEGORIES;
  }

  get languages(): [string, string][] {
    const languages = Object.entries(TemplateLanguageConstant).map(([key, value]) => {
      const displayName = key
        .replace(/_/g, ' (') + (key.includes('_') ? ')' : '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      return [displayName, value] as [string, string];
    });
    
    return languages.sort((a, b) => a[0].localeCompare(b[0]));
  }

  get broadcastOptions() {
    return TemplateConstants.BROADCAST_OPTIONS;
  }

  get buttonTypes() {
    return TemplateConstants.BUTTON_TYPES;
  }

  // Submission observables
  getSubmissionObservables() {
    return this.submissionService.getSubmissionObservables();
  }

  // Utility methods
  addVariableToBody() {
    const form = this.templateFormService.getForm();
    const currentBody = form.get('body')?.value || '';
    form.patchValue({ body: currentBody + ' {{variable}}' });
  }

  hasAtLeastOneButton(): boolean {
    return this.buttonManager.hasAtLeastOneButton();
  }

  applyButtonState(buttonState: any): void {
    if (buttonState.visitWebsiteButton) {
      this.buttonManager.updateState({ visitWebsiteButton: true });
      this.templateFormService.getForm().patchValue({ 
        websiteButtonText: buttonState.websiteButtonText, 
        websiteUrl: buttonState.websiteUrl 
      });
    }
    if (buttonState.callPhoneButton) {
      this.buttonManager.updateState({ callPhoneButton: true });
      this.templateFormService.getForm().patchValue({ 
        callButtonText: buttonState.callButtonText, 
        phoneNumber: buttonState.phoneNumber 
      });
    }
    if (buttonState.copyOfferButton) {
      this.buttonManager.updateState({ copyOfferButton: true });
      this.templateFormService.getForm().patchValue({ offerCode: buttonState.offerCode });
    }
    if (buttonState.quickReplyTexts?.length > 0) {
      buttonState.quickReplyTexts.forEach((text: string) => {
        this.buttonManager.toggleButton('quick reply', this.templateFormService.getForm());
        const quickReplyTexts = this.templateFormService.getForm().get('quickReplyTexts') as FormArray;
        const lastIndex = quickReplyTexts.length - 1;
        if (lastIndex >= 0) {
          quickReplyTexts.at(lastIndex).setValue(text);
        }
      });
    }
  }
} 