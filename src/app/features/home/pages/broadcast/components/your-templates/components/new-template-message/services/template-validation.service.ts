import { Injectable } from '@angular/core';
import { TemplateFormData } from './template-form.service';
import { ButtonState } from './button-manager.service';
import { TemplateConstants } from './template-constants.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TemplateValidationService {

  validateTemplateSubmission(formData: TemplateFormData, buttonState: ButtonState): ValidationResult {
    const errors: string[] = [];

    // Check if it's authentication category
    if (this.isAuthenticationCategory(formData.category)) {
      errors.push('Buttons are disabled and submission is not allowed for AUTHENTICATION category.');
      return { isValid: false, errors };
    }

    // Check marketing button requirement
    if (this.isMarketingCategory(formData.category) && !this.hasAtLeastOneButton(buttonState)) {
      errors.push('At least one button is required for Marketing templates.');
      return { isValid: false, errors };
    }

    // Validate form data
    const formErrors = this.validateFormData(formData);
    errors.push(...formErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFormData(formData: TemplateFormData): string[] {
    const errors: string[] = [];

    // Validate template name
    if (!formData.templateName) {
      errors.push('Template name is required.');
    } else if (!TemplateConstants.TEMPLATE_NAME_PATTERN.test(formData.templateName)) {
      errors.push('Template name can only contain letters, numbers, and underscores.');
    }

    // Validate category
    if (!formData.category) {
      errors.push('Category is required.');
    }

    // Validate language
    if (!formData.language) {
      errors.push('Language is required.');
    }

    // Validate body
    if (!formData.body) {
      errors.push('Body text is required.');
    }

    // Validate broadcast title specific fields
    if (formData.broadcastTitle === TemplateConstants.BROADCAST_TYPES.TEXT && !formData.text) {
      errors.push('Text content is required when broadcast title is set to Text.');
    }

    return errors;
  }

  validateButtonConfiguration(buttonState: ButtonState, formData: TemplateFormData): string[] {
    const errors: string[] = [];

    // Validate website button
    if (buttonState.visitWebsiteButton) {
      if (!formData.websiteButtonText) {
        errors.push('Website button text is required when website button is enabled.');
      }
      if (!formData.websiteUrl) {
        errors.push('Website URL is required when website button is enabled.');
      }
    }

    // Validate phone button
    if (buttonState.callPhoneButton) {
      if (!formData.callButtonText) {
        errors.push('Call button text is required when call button is enabled.');
      }
      if (!formData.phoneNumber) {
        errors.push('Phone number is required when call button is enabled.');
      }
    }

    // Validate copy offer button
    if (buttonState.copyOfferButton && !formData.offerCode) {
      errors.push('Offer code is required when copy offer button is enabled.');
    }

    return errors;
  }

  private isAuthenticationCategory(category: string): boolean {
    return category?.toUpperCase() === TemplateConstants.CATEGORY_TYPES.AUTHENTICATION;
  }

  private isMarketingCategory(category: string): boolean {
    return category?.toUpperCase() === TemplateConstants.CATEGORY_TYPES.MARKETING;
  }

  private hasAtLeastOneButton(buttonState: ButtonState): boolean {
    return buttonState.visitWebsiteButton ||
           buttonState.callPhoneButton ||
           buttonState.copyOfferButton ||
           buttonState.quickReplyButton > 0;
  }
} 