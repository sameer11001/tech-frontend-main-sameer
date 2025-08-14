import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TemplateComponent, WhatsAppTemplate } from '../../../../../../../../core/models/whatsapp-twmplate.model';
import { CommonModule } from '@angular/common';
import { WhatsAppPreviewComponent, WhatsAppButton } from '../../../whatsapp-preview/whatsapp-preview.component';

export interface TemplateDialogData {
  template: WhatsAppTemplate;
  broadcastTitle?: string;
  // Add more fields as needed
}

@Component({
  standalone: true,
  selector: 'app-template-details',
  templateUrl: './edit-temp-dialog.component.html',
  imports: [MatDialogModule, CommonModule, WhatsAppPreviewComponent],
})
export class TemplateDetailsComponent {
togglePreview() {
throw new Error('Method not implemented.');
}
  // Template info
  templateName: string = '';
  category: string = '';
  language: string = '';
  broadcastTitle: string = 'None';
  text: string = '';
  body: string = '';
  footer: string = '';
  mediaUrl: string = '';
  mediaType: 'image' | 'video' | 'document' | '' = '';
  
  // Button states (read-only)
  showButton: boolean = false;
  visitWebsiteButton: boolean = false;
  callPhoneButton: boolean = false;
  copyOfferButton: boolean = false;
  quickReplyButton: number = 0;
  quickReplyTexts: string[] = [];
  
  // Button data
  websiteButtonText: string = '';
  websiteUrl: string = '';
  callButtonText: string = '';
  phoneNumber: string = '';
  offerCode: string = '';
showMobilePreview: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TemplateDialogData,
    private dialogRef: MatDialogRef<TemplateDetailsComponent>
  ) {
    this.initializeTemplateData();
  }

  private initializeTemplateData(): void {
    // Extract template data
    this.templateName = this.data.template.name;
    this.category = this.data.template.category;
    this.language = this.data.template.language;
    
    // Extract components
    this.extractComponents();
    
    // Extract buttons
    this.extractButtons();
  }

  private extractComponents(): void {
    if (!this.data.template.components) return;

    // Extract header
    const headerComp = this.data.template.components.find(c => c.type === 'HEADER');
    if (headerComp) {
      if (headerComp.format === 'TEXT' && headerComp.text) {
        this.broadcastTitle = 'Text';
        this.text = headerComp.text;
      } else if (headerComp.format === 'IMAGE') {
        this.broadcastTitle = 'Image';
        this.mediaType = 'image';
        
        // Use cdnUrl from API response, fallback to local asset if empty
        this.mediaUrl = this.getMediaUrl(this.data.template.cdnUrl);
        
        // TODO: Remove this section when cdnUrl is fully implemented
        // If there's example data with header handles, try to use them
        if (headerComp.example && headerComp.example.header_handle && headerComp.example.header_handle.length > 0) {
          // Use the first header handle as the image URL if it looks like a valid URL
          const firstHandle = headerComp.example.header_handle[0];
          if (firstHandle && (firstHandle.startsWith('http://') || firstHandle.startsWith('https://'))) {
            this.mediaUrl = firstHandle;
          }
        }
      } else if (headerComp.format === 'VIDEO') {
        this.broadcastTitle = 'Video';
        this.mediaType = 'video';
        
        // Use cdnUrl from API response, fallback to local asset if empty
        this.mediaUrl = this.getMediaUrl(this.data.template.cdnUrl);
        
        // TODO: Remove this section when cdnUrl is fully implemented
        // this.mediaUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'; // Sample video
      } else if (headerComp.format === 'DOCUMENT') {
        this.broadcastTitle = 'Document';
        this.mediaType = 'document';
        
        // Use cdnUrl from API response, fallback to local asset if empty
        this.mediaUrl = this.getMediaUrl(this.data.template.cdnUrl);
        
        // TODO: Remove this section when cdnUrl is fully implemented
        // this.mediaUrl = 'document://sample-document.pdf'; // Document placeholder
      }
    }

    // Extract body
    const bodyComp = this.data.template.components.find(c => c.type === 'BODY');
    if (bodyComp && bodyComp.text) {
      this.body = bodyComp.text;
    }

    // Extract footer
    const footerComp = this.data.template.components.find(c => c.type === 'FOOTER');
    if (footerComp && footerComp.text) {
      this.footer = footerComp.text;
    }
  }

  private extractButtons(): void {
    if (!this.data.template.components) return;

    const buttonsComp = this.data.template.components.find(c => c.type === 'BUTTONS');
    if (!buttonsComp || !buttonsComp.buttons) return;

    this.showButton = true;
    this.quickReplyButton = 0;

    buttonsComp.buttons.forEach(btn => {
      switch (btn.type) {
        case 'QUICK_REPLY':
          this.quickReplyButton++;
          this.quickReplyTexts.push(btn.text || '');
          break;
        case 'URL':
          this.visitWebsiteButton = true;
          this.websiteButtonText = btn.text || '';
          this.websiteUrl = (btn as any).url || '';
          break;
        case 'PHONE':
          this.callPhoneButton = true;
          this.callButtonText = btn.text || '';
          this.phoneNumber = (btn as any).phone_number || '';
          break;
      }
    });
  }

  // Computed property for WhatsApp preview buttons
  get previewButtons(): WhatsAppButton[] {
    const buttons: WhatsAppButton[] = [];

    // Add website button
    if (this.visitWebsiteButton && this.websiteButtonText && this.websiteUrl) {
      buttons.push({
        type: 'URL',
        text: this.websiteButtonText,
        url: this.websiteUrl
      });
    }

    // Add phone button
    if (this.callPhoneButton && this.callButtonText && this.phoneNumber) {
      buttons.push({
        type: 'PHONE_NUMBER',
        text: this.callButtonText,
        phoneNumber: this.phoneNumber
      });
    }

    // Add copy offer button
    if (this.copyOfferButton && this.offerCode) {
      buttons.push({
        type: 'QUICK_REPLY',
        text: 'Copy Offer Code'
      });
    }

    // Add quick reply buttons
    if (this.quickReplyButton > 0 && this.quickReplyTexts.length > 0) {
      this.quickReplyTexts.forEach(text => {
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

  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Helper method to get the appropriate media URL
   * Prioritizes cdnUrl from API, falls back to local asset if empty
   */
  private getMediaUrl(cdnUrl?: string): string {
    if (cdnUrl && cdnUrl.trim() !== '') {
      return cdnUrl;
    }
    return 'assets/features/image_notFound.png';
  }
}
