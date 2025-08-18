// components/contact-info.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../../../../../../../core/models/conversation.model';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-info.component.html',
})
export class ContactInfoComponent {
  @Input() conversation?: Conversation;
}
