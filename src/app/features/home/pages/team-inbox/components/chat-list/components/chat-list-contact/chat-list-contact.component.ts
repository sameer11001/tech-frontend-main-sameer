import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Conversation } from '../../../../../../../../core/models/conversation.model';

@Component({
  selector: 'app-chat-list-contact',
  imports: [CommonModule],
  templateUrl: './chat-list-contact.component.html',
  styleUrl: './chat-list-contact.component.css'
})
export class ChatListContactComponent {
  @Input() conversation!: Conversation;
  @Input() selectedConversationId: string | null = null;
  @Output() select = new EventEmitter<Conversation>();

  onClick() {
    this.select.emit(this.conversation);
  }

  get isSelected(): boolean {
    return this.selectedConversationId === this.conversation.id;
  }
}
