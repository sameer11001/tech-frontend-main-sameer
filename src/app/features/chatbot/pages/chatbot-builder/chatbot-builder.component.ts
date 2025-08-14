import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotBuilderHeaderComponent } from './components/chatbot-builder-header/chatbot-builder-header.component';
import { ChatbotBuilderSidebarComponent, ActionBlock } from './components/chatbot-builder-sidebar/chatbot-builder-sidebar.component';
import { ChatbotBuilderCanvasComponent } from './components/chatbot-builder-canvas/chatbot-builder-canvas.component';

interface FlowBlock {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  connections?: string[];
  isEditing?: boolean;
}

interface Connection {
  from: string;
  to: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

@Component({
  selector: 'app-chatbot-builder',
  standalone: true,
  imports: [
    CommonModule, 
    ChatbotBuilderHeaderComponent, 
    ChatbotBuilderSidebarComponent, 
    ChatbotBuilderCanvasComponent
  ],
  templateUrl: './chatbot-builder.component.html',
  styleUrl: './chatbot-builder.component.css'
})
export class ChatbotBuilderComponent {
  flowBlocks: FlowBlock[] = [
    {
      id: 'start',
      type: 'start',
      title: 'Starting Step',
      x: 400,
      y: 100,
      connections: []
    }
  ];

  connections: Connection[] = [];

  constructor() {
    console.log('ChatbotBuilderComponent initialized with flowBlocks:', this.flowBlocks);
  }

  // Event handlers for child components
  onSave() {
    console.log('Save chatbot flow');
  }

  onTestChatbot() {
    console.log('Test chatbot');
  }

  onBlockAdded(data: {actionBlock: ActionBlock, x: number, y: number}) {
    const newBlock: FlowBlock = {
      id: Date.now().toString(),
      type: data.actionBlock.id,
      title: data.actionBlock.title,
      x: data.x,
      y: data.y,
      connections: []
    };
    
    this.flowBlocks.push(newBlock);
    
    // Automatically start editing send-message blocks
    if (data.actionBlock.id === 'send-message') {
      setTimeout(() => {
        newBlock.isEditing = true;
      }, 100);
    }
  }

  onBlockUpdated(block: FlowBlock) {
    const index = this.flowBlocks.findIndex(b => b.id === block.id);
    if (index !== -1) {
      // If this block is being set to editing, close all other editing blocks
      if (block.isEditing) {
        this.flowBlocks.forEach(b => {
          if (b.id !== block.id) {
            b.isEditing = false;
          }
        });
      }
      
      this.flowBlocks[index] = { ...block };
    }
  }

  onBlockDeleted(block: FlowBlock) {
    this.flowBlocks = this.flowBlocks.filter(b => b.id !== block.id);
    
    // Remove connections involving this block
    this.connections = this.connections.filter(
      conn => conn.from !== block.id && conn.to !== block.id
    );
  }

  onConnectionCreated(data: {from: FlowBlock, to: FlowBlock}) {
    // Check if connection already exists
    const exists = this.connections.some(
      conn => conn.from === data.from.id && conn.to === data.to.id
    );
    
    if (!exists) {
      const newConnection: Connection = {
        from: data.from.id,
        to: data.to.id,
        fromX: data.from.x + 96,
        fromY: data.from.y + 80,
        toX: data.to.x + 96,
        toY: data.to.y + 20
      };
      
      this.connections.push(newConnection);
      
      // Update block connections
      if (!data.from.connections) data.from.connections = [];
      data.from.connections.push(data.to.id);
    }
  }

  onConnectionsUpdated(connections: Connection[]) {
    this.connections = connections;
  }

  onSidebarDragStart(data: {event: DragEvent, block: ActionBlock}) {
    // The drag data is already set in the sidebar component
    // This method can be used for additional logic if needed
  }
} 