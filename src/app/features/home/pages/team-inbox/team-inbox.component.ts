import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  viewChild,
} from '@angular/core';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatDetailsComponent } from './components/chat-details/chat-details.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { Conversation } from '../../../../core/models/conversation.model';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../../../core/services/chat/socketio/socket.service';
import {
  ClientToServerEventsEnum,
  ServerToClientEventsEnum,
} from '../../../../core/models/socket-event.enum';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  addLocalMessage,
  updateMessageStatus,
} from '../../../../core/services/messages/ngrx/messages.actions';
import {
  sortConversations,
  updateConversationExpiration,
  updateConversationStatusLocally,
  updateConversationUserAssignment,
  updateLastMessage,
} from '../../../../core/services/conversations/ngrx/conversations.actions';
import { loadUsers } from '../../../../core/services/user-management/ngrx/user-management.actions';

@Component({
  selector: 'app-team-inbox',
  imports: [
    ChatWindowComponent,
    ChatListComponent,
    ChatDetailsComponent,
    CommonModule,
  ],
  templateUrl: './team-inbox.component.html',
  styleUrl: './team-inbox.component.css',
})
export class TeamInboxComponent implements OnInit, OnDestroy {
  selectedConversation: Conversation | null = null;
  expiryTime: string | null = null;
  is_expired: boolean = false;
  reset_counter: number = 0;
  private destroy$ = new Subject<void>();
  private notificationSound = new Audio('/assets/tech-gate-noti.mp3');

  constructor(private socketService: SocketService, private store: Store) {}

  ngOnInit() {
    this.listenForEvents();
    this.store.dispatch(loadUsers({ query: '', page: 1, limit: 100 }));
  }

  onSelectConversation(conversation: Conversation) {
    if (this.selectedConversation) {
      this.socketService.emit(ClientToServerEventsEnum.LeaveConversation, {
        conversation_id: this.selectedConversation.id,
      });
      this.selectedConversation = null;
      this.expiryTime = null;
      this.is_expired = false;
      this.reset_counter = 0;
    }
    this.selectedConversation = conversation;
    if (conversation.id) {
      this.socketService.emit(ClientToServerEventsEnum.JoinConversation, {
        conversation_id: conversation.id,
      });
      this.expiryTime = conversation.conversation_expiration_time;
      this.is_expired = conversation.conversation_is_expired;
    }
  }

  private listenForEvents() {
    this.socketService
      .onAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ event, data }) => {
        console.log(`Event received: ${event}`, data);
      });

    this.socketService
      .on(ServerToClientEventsEnum.MessageReceived)
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: any) => {
        this.store.dispatch(
          sortConversations({ conversationId: msg.conversation_id })
        );
        this.store.dispatch(
          updateLastMessage({
            conversationId: msg.conversation_id,
            lastMessage: msg.last_message_content,
            lastMessageTimestamp: msg.last_message_time,
          })
        );
        if (
          this.selectedConversation === null ||
          msg.conversation_id !== this.selectedConversation?.id
        ) {
          this.notificationSound.play().catch(() => {});
        }
      });

    this.socketService
      .on(ServerToClientEventsEnum.ConversationJoined)
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversation: any) => {
        this.store.dispatch(
          updateConversationExpiration({
            conversationId: conversation.conversation_id,
            expirationTime: conversation.expiration_time,
            isExpired: conversation.is_conversation_expired,
          })
        );
        this.reset_counter = 0;
        this.expiryTime = conversation.expiration_time;
        this.is_expired = conversation.is_conversation_expired;
      });

    this.socketService
      .on(ServerToClientEventsEnum.ConversationMessageReceived)
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: any) => {
        this.store.dispatch(addLocalMessage({ message: msg.message }));
        this.store.dispatch(
          updateConversationExpiration({
            conversationId: msg.conversation_id,
            expirationTime: '24:00:00',
            isExpired: false,
          })
        );
        this.reset_counter++;
        this.expiryTime = '24:00:00';
        this.is_expired = false;
      });

    this.socketService
      .on(ServerToClientEventsEnum.ConversationMessageStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: any) => {
        this.store.dispatch(
          updateMessageStatus({
            message_id: status.message_id,
            status: status.status,
          })
        );
      });

    this.socketService
      .on(ServerToClientEventsEnum.ConversationStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: any) => {
        console.log('Conversation status update:', status);
        this.store.dispatch(
          updateConversationStatusLocally({
            conversationId: status.conversation_id,
            status: status.status.toLowerCase(),
          })
        );
      });

    this.socketService
      .on(ServerToClientEventsEnum.ConversationUserAssignment)
      .pipe(takeUntil(this.destroy$))
      .subscribe((assignment: any) => {
        console.log('Conversation user assignment:', assignment);
        this.store.dispatch(
          updateConversationUserAssignment({
            conversationId: assignment.conversation_id,
            userId: assignment.assigned_to,
          })
        );
        this.store.dispatch(addLocalMessage({
          message: {
            message_type: 'assign',
            content:{
              message: assignment.assignment_message.content.message

            },
          },
        }));

      });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
