import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ChatListHeaderComponent } from "./components/chat-list-header/chat-list-header.component";
import { ChatListContactComponent } from "./components/chat-list-contact/chat-list-contact.component";
import { ConversationsFacade } from '../../../../../../core/services/conversations/ngrx/conversations.facade';
import { Conversation } from '../../../../../../core/models/conversation.model';
import { SocketService } from '../../../../../../core/services/chat/socketio/socket.service';


@Component({
  selector: 'app-chat-list',
  imports: [CommonModule, ChatListHeaderComponent, ChatListContactComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent {
  @Input() selectedConversationId: string | null = null;
  @Output() selectConversation = new EventEmitter<Conversation>();
  conversations$ = this.conversationsFacade.conversations$;
  meta$ = this.conversationsFacade.meta$;
  loading$ = this.conversationsFacade.loading$;
  error$ = this.conversationsFacade.error$;

  constructor(private conversationsFacade: ConversationsFacade, private socketService: SocketService) {
    this.conversationsFacade.loadConversations(1, 10);
    this.conversations$.subscribe((conversations) => {
      console.log(conversations);
    });
    this.meta$.subscribe((meta) => {
      console.log(meta);
    });
    this.loading$.subscribe((loading) => {
      console.log(loading);
    });
  }

  onSelectConversation(conversation: Conversation) {
    this.selectConversation.emit(conversation);
  }
}
