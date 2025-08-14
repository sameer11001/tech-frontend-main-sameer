import { Component, Input } from '@angular/core';
import { ChatWindowHeaderComponent } from "./components/chat-window-header/chat-window-header.component";
import { ChatWindowBodyComponent } from "./components/chat-window-body/chat-window-body.component";
import { ChatWindowInputComponent } from "./components/chat-window-input/chat-window-input.component";
import { Conversation } from '../../../../../../core/models/conversation.model';

@Component({
  selector: 'app-chat-window',
  imports: [ChatWindowHeaderComponent, ChatWindowBodyComponent, ChatWindowInputComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  @Input() conversation!: Conversation;
  @Input() expiry_time: string | null = null;
  @Input() reset_counter: number = 0;
  @Input() isExpired: boolean = false;
}
