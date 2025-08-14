import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FlowBlock {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  data?: any;
  isEditing?: boolean;
  connections?: string[];
}

@Component({
  selector: 'app-flow-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [style.left.px]="block.x"
      [style.top.px]="block.y"
      (click)="onBlockClick()"
      (mousedown)="onStartDrag($event)"
      [class]="'absolute p-4 rounded-lg text-white shadow-lg min-w-48 flow-block ' + getBlockColor()"
      [class.dragging]="isDragging"
      [style.z-index]="isDragging ? 1000 : 1"
      [style.transition]="isDragging ? 'none' : 'transform 0.2s ease-out'"
      [style.transform]="'scale(' + (isDragging ? '1.05' : '1') + ')'">
      
      <!-- Start Block -->
      <div *ngIf="block.type === 'start'" class="text-center relative">
        <!-- Delete Button -->
        <button 
          *ngIf="block.id !== 'start'"
          (click)="onDeleteBlock(); $event.stopPropagation()"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
        
        <div class="text-sm font-medium mb-1">{{ block.title }}</div>
        
        <!-- Connection Dot -->
        <div class="relative">
          <div 
            class="w-4 h-4 bg-white rounded-full mx-auto border-2 border-gray-300 hover:border-green-500 cursor-pointer transition-colors"
            (mousedown)="onStartConnection($event)"
            (mouseup)="onCompleteConnection($event)">
          </div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
      
      <!-- Send Message Block -->
      <div *ngIf="block.type === 'send-message'" class="text-center relative">
        <!-- Delete Button -->
        <button 
          (click)="onDeleteBlock(); $event.stopPropagation()"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
        
        <div class="text-sm font-medium mb-2">{{ block.title }}</div>
        
        <!-- Content Preview -->
        <div *ngIf="!block.isEditing" class="mb-2">
          <div class="flex justify-center space-x-2 mb-2">
            <div class="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">💬</div>
            <div class="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">📷</div>
            <div class="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">🎥</div>
            <div class="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">🎵</div>
            <div class="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">📄</div>
          </div>
          <div *ngIf="block.data?.content" class="text-xs text-white bg-black bg-opacity-20 rounded px-2 py-1">
            {{ block.data.content.length > 30 ? (block.data.content | slice:0:30) + '...' : block.data.content }}
          </div>
        </div>
        
        <!-- Connection Dot -->
        <div class="relative">
          <div 
            (mousedown)="onStartConnection($event)"
            (mouseup)="onCompleteConnection($event)"
            class="w-4 h-4 bg-white rounded-full mx-auto border-2 border-gray-300 hover:border-green-500 cursor-pointer transition-colors">
          </div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
      
      <!-- Ask Question Block -->
      <div *ngIf="block.type === 'ask-question'" class="text-center relative">
        <!-- Delete Button -->
        <button 
          (click)="onDeleteBlock(); $event.stopPropagation()"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
        
        <div class="text-sm font-medium mb-2">{{ block.title }}</div>
        <div class="text-xs mb-2">Ask anything to the user</div>
        <div class="flex justify-center space-x-1 mb-2">
          <div class="px-2 py-1 bg-white text-black rounded text-xs">Answer 1</div>
          <div class="px-2 py-1 bg-white text-black rounded text-xs">Default</div>
        </div>
        
        <!-- Connection Dot -->
        <div class="relative">
          <div 
            class="w-4 h-4 bg-white rounded-full mx-auto border-2 border-gray-300 hover:border-green-500 cursor-pointer transition-colors"
            (mousedown)="onStartConnection($event)"
            (mouseup)="onCompleteConnection($event)">
          </div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
      
      <!-- Set Condition Block -->
      <div *ngIf="block.type === 'set-condition'" class="text-center relative">
        <!-- Delete Button -->
        <button 
          (click)="onDeleteBlock(); $event.stopPropagation()"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
        
        <div class="text-sm font-medium mb-2">{{ block.title }}</div>
        <div class="text-xs mb-2">Logical conditions</div>
        
        <!-- Connection Dot -->
        <div class="relative">
          <div 
            class="w-4 h-4 bg-white rounded-full mx-auto border-2 border-gray-300 hover:border-green-500 cursor-pointer transition-colors"
            (mousedown)="onStartConnection($event)"
            (mouseup)="onCompleteConnection($event)">
          </div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FlowBlockComponent {
  @Input() block!: FlowBlock;
  @Input() isDragging = false;

  @Output() blockClick = new EventEmitter<FlowBlock>();
  @Output() startDrag = new EventEmitter<{event: MouseEvent, block: FlowBlock}>();
  @Output() deleteBlock = new EventEmitter<FlowBlock>();
  @Output() startConnection = new EventEmitter<{event: MouseEvent, block: FlowBlock}>();
  @Output() completeConnection = new EventEmitter<{event: MouseEvent, block: FlowBlock}>();

  onBlockClick() {
    this.blockClick.emit(this.block);
  }

  onStartDrag(event: MouseEvent) {
    this.startDrag.emit({ event, block: this.block });
  }

  onDeleteBlock() {
    this.deleteBlock.emit(this.block);
  }

  onStartConnection(event: MouseEvent) {
    this.startConnection.emit({ event, block: this.block });
  }

  onCompleteConnection(event: MouseEvent) {
    this.completeConnection.emit({ event, block: this.block });
  }

  getBlockColor(): string {
    switch (this.block.type) {
      case 'start':
        return 'bg-green-500';
      case 'send-message':
        return 'bg-red-400';
      case 'ask-question':
        return 'bg-orange-400';
      case 'set-condition':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  }
} 