import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActionBlock {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: string;
}

@Component({
  selector: 'app-chatbot-builder-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-builder-sidebar.component.html',
  styleUrl: './chatbot-builder-sidebar.component.css'
})
export class ChatbotBuilderSidebarComponent {
  @Output() dragStart = new EventEmitter<{event: DragEvent, block: ActionBlock}>();

  actionBlocks: ActionBlock[] = [
    {
      id: 'send-message',
      title: 'Send a message',
      description: 'With no response required from visitor',
      icon: '💬',
      color: 'bg-red-400',
      type: 'send-message'
    },
    {
      id: 'ask-question',
      title: 'Ask a question',
      description: 'Ask question and store user input in variable',
      icon: '❓',
      color: 'bg-orange-400',
      type: 'ask-question'
    },
    {
      id: 'set-condition',
      title: 'Set a condition',
      description: 'Send message(s) based on logical condition(s)',
      icon: '⚡',  
      color: 'bg-blue-400',
      type: 'set-condition'
    }
  ];

  onDragStart(event: DragEvent, block: ActionBlock) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(block));
      event.dataTransfer.effectAllowed = 'copy';
    }
    
    this.dragStart.emit({event, block});
  }
} 