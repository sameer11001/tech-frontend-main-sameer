import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowBlock } from '../flow-block/flow-block.component';
import { FlowBlockComponent } from '../flow-block/flow-block.component';
import { BlockEditorComponent } from '../block-editor/block-editor.component';
import { CanvasControlsComponent } from '../canvas-controls/canvas-controls.component';
import { ActionBlock } from '../chatbot-builder-sidebar/chatbot-builder-sidebar.component';

export interface Connection {
  from: string;
  to: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

@Component({
  selector: 'app-chatbot-canvas',
  standalone: true,
  imports: [CommonModule, FlowBlockComponent, BlockEditorComponent, CanvasControlsComponent],
  template: `
    <div class="flex-1 bg-red-500 relative overflow-hidden" style="min-height: 400px;">
      <div class="text-white p-4">
        CANVAS COMPONENT IS RENDERING - Scale: {{canvasScale}} - Blocks: {{flowBlocks.length}}
      </div>
      
      <!-- Simple Canvas Test -->
      <div 
        class="absolute inset-0 bg-gray-100"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (wheel)="onCanvasWheel($event)"
        (mousedown)="onCanvasMouseDown($event)">
        
        <!-- Grid Background -->
        <div class="w-full h-full opacity-30">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <!-- Test Block -->
        <div class="absolute top-20 left-20 bg-blue-500 text-white p-4 rounded">
          Test Block - Canvas Working!
        </div>
        
        <!-- Zoom Controls -->
        <div class="absolute bottom-4 right-4 space-y-2">
          <button (click)="onZoomIn()" class="block bg-white border rounded p-2">+</button>
          <button (click)="onZoomOut()" class="block bg-white border rounded p-2">-</button>
          <button (click)="onResetView()" class="block bg-white border rounded p-2 text-xs">Reset</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      cursor: grab;
    }
    .canvas-container.panning {
      cursor: grabbing;
    }
  `]
})
export class ChatbotCanvasComponent implements OnChanges {
  @Input() flowBlocks: FlowBlock[] = [];
  @Input() connections: Connection[] = [];
  
  @Output() blockAdded = new EventEmitter<{actionBlock: ActionBlock, x: number, y: number}>();
  @Output() blockUpdated = new EventEmitter<FlowBlock>();
  @Output() blockDeleted = new EventEmitter<FlowBlock>();
  @Output() connectionCreated = new EventEmitter<{from: FlowBlock, to: FlowBlock}>();
  @Output() connectionsUpdated = new EventEmitter<Connection[]>();

  // Canvas state
  canvasScale = 1;
  canvasPosition = { x: 0, y: 0 };
  isPanning = false;
  panStart = { x: 0, y: 0 };
  minScale = 0.25;
  maxScale = 3;

  // Dragging state
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  selectedBlock: FlowBlock | null = null;
  editingBlock: FlowBlock | null = null;

  // Connection state
  isConnecting = false;
  connectionStart: { blockId: string; x: number; y: number } | null = null;

  ngOnChanges(changes: SimpleChanges) {
    // Update the editing block reference when flowBlocks changes
    if (changes['flowBlocks'] && this.flowBlocks) {
      const editingBlock = this.flowBlocks.find(block => block.isEditing);
      this.editingBlock = editingBlock || null;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    
    if (data) {
      try {
        const actionBlock = JSON.parse(data);
        const canvasRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        
        // Convert screen coordinates to canvas coordinates
        const screenX = event.clientX - canvasRect.left;
        const screenY = event.clientY - canvasRect.top;
        
        const canvasX = (screenX - this.canvasPosition.x) / this.canvasScale;
        const canvasY = (screenY - this.canvasPosition.y) / this.canvasScale;
        
        this.blockAdded.emit({ actionBlock, x: canvasX, y: canvasY });
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onBlockClick(block: FlowBlock) {
    if (!this.isDragging && !this.isConnecting) {
      // Create a copy of the block to avoid direct mutation
      const updatedBlock = { ...block };
      
      // Initialize block data if it doesn't exist
      if (!updatedBlock.data) {
        updatedBlock.data = {
          messageType: 'message',
          content: '',
          caption: '',
          file: null
        };
      }
      
      // Set editing state
      updatedBlock.isEditing = true;
      this.editingBlock = updatedBlock;
      
      // Emit the block update to parent
      this.blockUpdated.emit(updatedBlock);
    }
  }

  onStartDrag(data: {event: MouseEvent, block: FlowBlock}) {
    const { event, block } = data;
    event.stopPropagation();
    
    this.isDragging = true;
    this.selectedBlock = block;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;

    const mouseMoveHandler = (e: MouseEvent) => {
      if (this.isDragging && this.selectedBlock) {
        const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
        if (canvasRect) {
          const newX = (e.clientX - canvasRect.left - this.canvasPosition.x - this.dragOffset.x) / this.canvasScale;
          const newY = (e.clientY - canvasRect.top - this.canvasPosition.y - this.dragOffset.y) / this.canvasScale;
          
          this.selectedBlock.x = Math.max(0, Math.min(newX, 5000));
          this.selectedBlock.y = Math.max(0, Math.min(newY, 5000));
          
          this.updateConnections();
        }
      }
    };

    const mouseUpHandler = () => {
      if (this.isDragging && this.selectedBlock) {
        this.blockUpdated.emit(this.selectedBlock);
      }
      this.isDragging = false;
      this.selectedBlock = null;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  onDeleteBlock(block: FlowBlock) {
    this.blockDeleted.emit(block);
  }

  onStartConnection(data: {event: MouseEvent, block: FlowBlock}) {
    const { event, block } = data;
    event.stopPropagation();
    
    this.isConnecting = true;
    this.connectionStart = {
      blockId: block.id,
      x: block.x + 96, // Center of block
      y: block.y + 80
    };
  }

  onCompleteConnection(data: {event: MouseEvent, block: FlowBlock}) {
    const { event, block } = data;
    event.stopPropagation();
    
    if (this.isConnecting && this.connectionStart && this.connectionStart.blockId !== block.id) {
      const fromBlock = this.flowBlocks.find(b => b.id === this.connectionStart!.blockId);
      if (fromBlock) {
        this.connectionCreated.emit({ from: fromBlock, to: block });
      }
    }
    
    this.isConnecting = false;
    this.connectionStart = null;
  }

  onCanvasWheel(event: WheelEvent) {
    event.preventDefault();
    
    const zoomSensitivity = 0.001;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const zoom = event.deltaY * zoomSensitivity;
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.canvasScale - zoom));
    
    if (newScale !== this.canvasScale) {
      const scaleRatio = newScale / this.canvasScale;
      
      this.canvasPosition.x = mouseX - (mouseX - this.canvasPosition.x) * scaleRatio;
      this.canvasPosition.y = mouseY - (mouseY - this.canvasPosition.y) * scaleRatio;
      
      this.canvasScale = newScale;
    }
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.canvas-transform')) {
      this.isPanning = true;
      this.panStart.x = event.clientX - this.canvasPosition.x;
      this.panStart.y = event.clientY - this.canvasPosition.y;
      
      // Close any open editing panels by emitting updates for all blocks
      this.flowBlocks.forEach(block => {
        if (block.isEditing) {
          const updatedBlock = { ...block, isEditing: false };
          this.blockUpdated.emit(updatedBlock);
        }
      });
      this.editingBlock = null;
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      if (this.isPanning) {
        this.canvasPosition.x = e.clientX - this.panStart.x;
        this.canvasPosition.y = e.clientY - this.panStart.y;
      }
    };

    const mouseUpHandler = () => {
      this.isPanning = false;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  onZoomIn() {
    const newScale = Math.min(this.maxScale, this.canvasScale + 0.25);
    this.canvasScale = newScale;
  }

  onZoomOut() {
    const newScale = Math.max(this.minScale, this.canvasScale - 0.25);
    this.canvasScale = newScale;
  }

  onResetView() {
    this.canvasScale = 1;
    this.canvasPosition = { x: 0, y: 0 };
  }

  onSaveBlockEditing(block: FlowBlock) {
    const updatedBlock = { ...block, isEditing: false };
    this.editingBlock = null;
    this.blockUpdated.emit(updatedBlock);
  }

  onCancelBlockEditing() {
    if (this.editingBlock) {
      const updatedBlock = { ...this.editingBlock, isEditing: false };
      this.editingBlock = null;
      this.blockUpdated.emit(updatedBlock);
    }
  }

  private updateConnections() {
    const updatedConnections = this.connections.map(connection => {
      const fromBlock = this.flowBlocks.find(b => b.id === connection.from);
      const toBlock = this.flowBlocks.find(b => b.id === connection.to);
      
      if (fromBlock && toBlock) {
        return {
          ...connection,
          fromX: fromBlock.x + 96,
          fromY: fromBlock.y + 80,
          toX: toBlock.x + 96,
          toY: toBlock.y + 20
        };
      }
      return connection;
    });
    
    this.connectionsUpdated.emit(updatedConnections);
  }
} 