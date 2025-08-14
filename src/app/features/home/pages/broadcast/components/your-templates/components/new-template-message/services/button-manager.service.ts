import { Injectable } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { WhatsAppButton } from '../../../../whatsapp-preview/whatsapp-preview.component';
import { TemplateConstants } from './template-constants.service';

export interface ButtonState {
  showButton: boolean;
  visitWebsiteButton: boolean;
  callPhoneButton: boolean;
  copyOfferButton: boolean;
  quickReplyButton: number;
  marketingButtonRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ButtonManagerService {
  private state: ButtonState = {
    showButton: false,
    visitWebsiteButton: false,
    callPhoneButton: false,
    copyOfferButton: false,
    quickReplyButton: 0,
    marketingButtonRequired: false
  };

  constructor(private fb: FormBuilder) {}

  getState(): ButtonState {
    return { ...this.state };
  }

  updateState(newState: Partial<ButtonState>): void {
    this.state = { ...this.state, ...newState };
  }

  toggleButton(buttonType: string, form: any): void {
    switch (buttonType.toLowerCase()) {
      case 'website':
        this.state.visitWebsiteButton = !this.state.visitWebsiteButton;
        if (!this.state.visitWebsiteButton) {
          form.patchValue({ websiteButtonText: '', websiteUrl: '' });
        }
        break;
      case 'call phone':
        this.state.callPhoneButton = !this.state.callPhoneButton;
        if (!this.state.callPhoneButton) {
          form.patchValue({ callButtonText: '', phoneNumber: '' });
        }
        break;
      case 'copy offer':
        this.state.copyOfferButton = !this.state.copyOfferButton;
        if (!this.state.copyOfferButton) {
          form.patchValue({ offerCode: '' });
        }
        break;
      case 'quick reply':
        if (this.state.quickReplyButton < TemplateConstants.MAX_QUICK_REPLY_BUTTONS) {
          this.state.quickReplyButton++;
          const quickReplyTexts = form.get('quickReplyTexts') as FormArray;
          quickReplyTexts.push(this.fb.control(''));
        }
        break;
    }
  }

  removeQuickReplyButton(index: number, form: any): void {
    if (this.state.quickReplyButton > 0) {
      this.state.quickReplyButton--;
      const quickReplyTexts = form.get('quickReplyTexts') as FormArray;
      quickReplyTexts.removeAt(index);
    }
  }

  resetButtons(form: any): void {
    this.state = {
      showButton: false,
      visitWebsiteButton: false,
      callPhoneButton: false,
      copyOfferButton: false,
      quickReplyButton: 0,
      marketingButtonRequired: false
    };
    
    const quickReplyTexts = form.get('quickReplyTexts') as FormArray;
    quickReplyTexts.clear();
  }

  hasAtLeastOneButton(): boolean {
    return this.state.visitWebsiteButton ||
           this.state.callPhoneButton ||
           this.state.copyOfferButton ||
           this.state.quickReplyButton > 0;
  }

  generatePreviewButtons(form: any): WhatsAppButton[] {
    const buttons: WhatsAppButton[] = [];
    
    // Add website button
    if (this.state.visitWebsiteButton && form.get('websiteButtonText')?.value && form.get('websiteUrl')?.value) {
      buttons.push({
        type: 'URL',
        text: form.get('websiteButtonText')?.value,
        url: form.get('websiteUrl')?.value
      });
    }

    // Add phone button
    if (this.state.callPhoneButton && form.get('callButtonText')?.value && form.get('phoneNumber')?.value) {
      buttons.push({
        type: 'PHONE_NUMBER',
        text: form.get('callButtonText')?.value,
        phoneNumber: form.get('phoneNumber')?.value
      });
    }

    // Add copy offer button
    if (this.state.copyOfferButton && form.get('offerCode')?.value) {
      buttons.push({
        type: 'QUICK_REPLY',
        text: 'Copy Offer Code'
      });
    }

    // Add quick reply buttons
    if (this.state.quickReplyButton > 0 && form.get('quickReplyTexts')?.value) {
      const quickReplyTexts = form.get('quickReplyTexts')?.value as string[];
      quickReplyTexts.forEach(text => {
        if (text && text.trim()) {
          buttons.push({
            type: 'QUICK_REPLY',
            text: text.trim()
          });
        }
      });
    }

    return buttons;
  }

  handleCategoryChange(category: string): void {
    if (category === TemplateConstants.CATEGORY_TYPES.AUTHENTICATION) {
      this.state.showButton = false;
      this.state.visitWebsiteButton = false;
      this.state.callPhoneButton = false;
      this.state.copyOfferButton = false;
      this.state.quickReplyButton = 0;
      this.state.marketingButtonRequired = false;
    } else if (category === TemplateConstants.CATEGORY_TYPES.MARKETING && !this.hasAtLeastOneButton()) {
      this.state.showButton = true;
    }
  }

  validateMarketingButtons(): boolean {
    if (this.state.marketingButtonRequired) {
      return this.hasAtLeastOneButton();
    }
    return true;
  }
} 