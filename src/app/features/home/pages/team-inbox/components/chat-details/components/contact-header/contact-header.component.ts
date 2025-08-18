// components/contact-header.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../../../../../../../core/models/conversation.model';

@Component({
  selector: 'app-contact-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-header.component.html',
})
export class ContactHeaderComponent {
  @Input() conversation?: Conversation;
}
