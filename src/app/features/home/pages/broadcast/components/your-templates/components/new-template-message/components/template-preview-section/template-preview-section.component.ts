// template-preview-section.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppButton, WhatsAppPreviewComponent } from '../../../../../whatsapp-preview/whatsapp-preview.component';

@Component({
  selector: 'app-template-preview-section',
  standalone: true,
  imports: [CommonModule, WhatsAppPreviewComponent],
  templateUrl: './template-preview-section.component.html',
})
export class TemplatePreviewSectionComponent {
  @Input() header: string = '';
  @Input() body: string = '';
  @Input() footer: string = '';
  @Input() mediaUrl: string = '';
  @Input() mediaType: 'image' | 'video' | 'document' | '' = '';
  @Input() buttons: WhatsAppButton[] = [];
  @Input() time: string = '';
}
