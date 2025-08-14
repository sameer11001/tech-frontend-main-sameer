import { Injectable } from '@angular/core';
import { TemplateFormData } from './template-form.service';
import { ButtonState } from './button-manager.service';
import { TemplateConstants } from './template-constants.service';
import { CreateTemplateRequest } from '../../../../../../../../../core/models/whatsapp-yourtemplate.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateBuilderService {

  buildTemplateRequest(
    formData: TemplateFormData, 
    buttonState: ButtonState, 
    mediaIds: { [key: string]: string }
  ): CreateTemplateRequest {
    // Map language code as in original
    let languageCode = formData.language;
    if (languageCode === 'ar') languageCode = 'ar_EG';
    else if (languageCode === 'en') languageCode = 'en_US';
    else if (languageCode === 'es') languageCode = 'es_ES';
    else if (languageCode === 'fr') languageCode = 'fr_FR';
    else if (languageCode === 'de') languageCode = 'de_DE';

    // HEADER - exactly as in original
    let header: any = undefined;
    if (formData.broadcastTitle !== 'None') {
      header = {
        format: formData.broadcastTitle.toUpperCase(),
        variables: []
      };
      if (formData.broadcastTitle === 'Text') {
        header.text = formData.text;
      } else if (formData.broadcastTitle === 'Image') {
        header.media_handle = mediaIds['image'];
      } else if (formData.broadcastTitle === 'Video') {
        header.media_handle = mediaIds['video'];
      } else if (formData.broadcastTitle === 'Document') {
        header.media_handle = mediaIds['document'];
      }
    }

    // BODY - exactly as in original
    const body: any = {
      text: formData.body,
      variables: []
    };

    // FOOTER - exactly as in original
    const footer: any = formData.footer ? { text: formData.footer } : undefined;

    // BUTTONS - exactly as in original
    const buttons: any[] = [];
    if (buttonState.visitWebsiteButton && formData.websiteButtonText && formData.websiteUrl) {
      buttons.push({
        type: 'URL',
        text: formData.websiteButtonText,
        url: formData.websiteUrl
      });
    }
    if (buttonState.callPhoneButton && formData.callButtonText && formData.phoneNumber) {
      buttons.push({
        type: 'URL', // as in original
        text: formData.callButtonText,
        phone_number: formData.phoneNumber
      });
    }
    if (buttonState.copyOfferButton && formData.offerCode) {
      buttons.push({
        type: 'QUICK_REPLY',
        text: 'Copy Offer Code'
      });
    }
    if (buttonState.quickReplyButton > 0 && formData.quickReplyTexts?.length > 0) {
      for (const replyText of formData.quickReplyTexts) {
        if (replyText) {
          buttons.push({
            type: 'QUICK_REPLY',
            text: replyText
          });
        }
      }
    }

    // Build request - exactly as in original
    const request: any = {
      name: formData.templateName,
      category: formData.category.toUpperCase(),
      language: languageCode,
    };
    if (header) request.header = header;
    if (body) request.body = body;
    if (footer) request.footer = footer;
    if (buttons.length > 0) request.buttons = buttons;

    return request;
  }

  buildTemplateFromExisting(template: any): Partial<TemplateFormData> {
    const formData: Partial<TemplateFormData> = {
      templateName: '',
      body: '',
      footer: '',
      text: '',
      image: '',
      video: '',
      document: '',
      websiteButtonText: '',
      websiteUrl: '',
      callButtonText: '',
      phoneNumber: '',
      offerCode: '',
      broadcastTitle: TemplateConstants.BROADCAST_TYPES.NONE,
    };

    if (!template.components || !Array.isArray(template.components)) {
      console.log('No components array found in template:', template);
      return formData;
    }

    for (const comp of template.components) {
      if (comp.type === 'HEADER') {
        this.mapHeaderComponent(comp, formData);
      } else if (comp.type === 'BODY') {
        formData.body = comp.text || '';
      } else if (comp.type === 'FOOTER') {
        formData.footer = comp.text || '';
      }
    }

    return formData;
  }

  private mapHeaderComponent(header: any, formData: Partial<TemplateFormData>): void {
    if (header.format === 'TEXT') {
      formData.broadcastTitle = TemplateConstants.BROADCAST_TYPES.TEXT;
      formData.text = header.text || '';
    } else if (header.format === 'IMAGE') {
      formData.broadcastTitle = TemplateConstants.BROADCAST_TYPES.IMAGE;
      formData.image = header.example?.header_handle?.[0] || '';
    } else if (header.format === 'VIDEO') {
      formData.broadcastTitle = TemplateConstants.BROADCAST_TYPES.VIDEO;
      formData.video = header.example?.header_handle?.[0] || '';
    } else if (header.format === 'DOCUMENT') {
      formData.broadcastTitle = TemplateConstants.BROADCAST_TYPES.DOCUMENT;
      formData.document = header.example?.header_handle?.[0] || '';
    }
  }

  mapButtonsFromTemplate(buttons: any[]): any {
    const buttonState: any = {
      visitWebsiteButton: false,
      callPhoneButton: false,
      copyOfferButton: false,
      quickReplyTexts: []
    };

    for (const btn of buttons) {
      if (btn.type === 'URL') {
        if (btn.phone_number || btn.phoneNumber) {
          buttonState.callPhoneButton = true;
          buttonState.callButtonText = btn.text || '';
          buttonState.phoneNumber = btn.phone_number || btn.phoneNumber || '';
        } else {
          buttonState.visitWebsiteButton = true;
          buttonState.websiteButtonText = btn.text || '';
          buttonState.websiteUrl = btn.url || '';
        }
      } else if (btn.type === 'QUICK_REPLY') {
        if (btn.text && btn.text.toLowerCase().includes('offer')) {
          buttonState.copyOfferButton = true;
          buttonState.offerCode = btn.text;
        } else {
          buttonState.quickReplyTexts.push(btn.text || '');
        }
      }
    }

    return buttonState;
  }
} 