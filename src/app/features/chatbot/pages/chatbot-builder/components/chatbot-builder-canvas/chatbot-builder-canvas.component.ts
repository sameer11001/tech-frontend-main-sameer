import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FlowBlock {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  data?: any;
  isNew?: boolean;
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
  selector: 'app-chatbot-builder-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-builder-canvas.component.html',
  styleUrl: './chatbot-builder-canvas.component.css'
})
export class ChatbotBuilderCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;
  
  @Input() flowBlocks: FlowBlock[] = [];
  @Input() connections: Connection[] = [];
  
  @Output() blockAdded = new EventEmitter<{actionBlock: any, x: number, y: number}>();
  @Output() blockUpdated = new EventEmitter<FlowBlock>();
  @Output() blockDeleted = new EventEmitter<FlowBlock>();
  @Output() connectionCreated = new EventEmitter<{from: FlowBlock, to: FlowBlock}>();
  @Output() connectionsUpdated = new EventEmitter<Connection[]>();
  
  // Canvas transformation properties
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  
  // Mouse interaction state
  isPanning = false;
  isDraggingBlock = false;
  draggedBlock: FlowBlock | null = null;
  lastMouseX = 0;
  lastMouseY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;
  
  // Math reference for template
  Math = Math;
  
  showSendMessageModal = false;
  showAskQuestionModal = false;
  selectedBlock: FlowBlock | null = null;

  ngOnInit() {
    // Remove the setupEventListeners call from ngOnInit
    // We'll set up listeners after the view is initialized
  }

  ngAfterViewInit() {
    console.log('Canvas AfterViewInit - flowBlocks:', this.flowBlocks);
    console.log('Canvas element:', this.canvasRef.nativeElement);
    this.setupEventListeners();
    this.updateCanvasTransform();
  }

  private setupEventListeners() {
    const canvas = this.canvasRef.nativeElement;
    
    // Mouse wheel for zooming
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    
    // Mouse events for panning and dragging
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(3, this.zoomLevel * delta));
    
    if (newZoom !== this.zoomLevel) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Zoom towards mouse position
      const zoomFactor = newZoom / this.zoomLevel;
      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      
      this.zoomLevel = newZoom;
      this.updateCanvasTransform();
    }
  }

  private onMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Check if clicking on a block
    const blockElement = target.closest('.flow-block') as HTMLElement;
    if (blockElement) {
      const blockId = blockElement.getAttribute('data-block-id');
      const block = this.flowBlocks.find(b => b.id === blockId);
      
      if (block) {
        // Prevent dragging if clicking on buttons/interactive elements
        if (target.closest('button') || target.closest('.no-drag')) {
          return;
        }
        
        event.preventDefault(); // Prevent text selection
        
        this.isDraggingBlock = true;
        this.draggedBlock = block;
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        blockElement.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
        return;
      }
    }
    
    // Start panning if not clicking on a block
    this.isPanning = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.canvasRef.nativeElement.classList.add('panning');
    document.body.style.cursor = 'grabbing';
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDraggingBlock && this.draggedBlock) {
      // Move block - more responsive movement
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      
      this.draggedBlock.x += deltaX / this.zoomLevel;
      this.draggedBlock.y += deltaY / this.zoomLevel;
      
      // Constrain to reasonable bounds
      this.draggedBlock.x = Math.max(0, Math.min(this.draggedBlock.x, 2000));
      this.draggedBlock.y = Math.max(0, Math.min(this.draggedBlock.y, 2000));
      
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      
    } else if (this.isPanning) {
      // Pan canvas - smoother panning
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      
      this.panX += deltaX;
      this.panY += deltaY;
      
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      
      this.updateCanvasTransform();
    }
  }

  private onMouseUp(event: MouseEvent) {
    if (this.isDraggingBlock && this.draggedBlock) {
      const blockElement = document.querySelector(`[data-block-id="${this.draggedBlock.id}"]`);
      if (blockElement) {
        blockElement.classList.remove('dragging');
      }
      
      this.blockUpdated.emit(this.draggedBlock);
      this.draggedBlock = null;
    }
    
    // Reset cursors and states
    this.isDraggingBlock = false;
    this.isPanning = false;
    this.canvasRef.nativeElement.classList.remove('panning');
    document.body.style.cursor = 'default';
  }

  private updateCanvasTransform() {
    const canvas = this.canvasRef.nativeElement.querySelector('.canvas-content') as HTMLElement;
    if (canvas) {
      canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
      console.log('Canvas transform applied:', canvas.style.transform);
    } else {
      console.warn('Canvas content element not found for transform');
    }
  }

  // Drag and drop from sidebar
  onDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    if (data) {
      const actionBlock = JSON.parse(data);
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      
      // Convert screen coordinates to canvas coordinates
      const x = (event.clientX - rect.left - this.panX) / this.zoomLevel;
      const y = (event.clientY - rect.top - this.panY) / this.zoomLevel;
      
      this.addBlock(actionBlock, x, y);
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  addBlock(actionBlock: any, x: number, y: number) {
    // Emit block added event to parent component
    this.blockAdded.emit({actionBlock, x, y});
    
    // Open appropriate modal based on block type
    if (actionBlock.id === 'send-message' || actionBlock.type === 'send-message') {
      // Find the newly added block in flowBlocks (will be added by parent)
      setTimeout(() => {
        const newBlock = this.flowBlocks[this.flowBlocks.length - 1];
        if (newBlock) {
          this.selectedBlock = newBlock;
          this.showSendMessageModal = true;
        }
      }, 100);
    } else if (actionBlock.id === 'ask-question' || actionBlock.type === 'ask-question') {
      setTimeout(() => {
        const newBlock = this.flowBlocks[this.flowBlocks.length - 1];
        if (newBlock) {
          this.selectedBlock = newBlock;
          this.showAskQuestionModal = true;
        }
      }, 100);
    }
  }
  
  onBlockClick(block: FlowBlock, event: Event) {
    // Prevent click if we were dragging
    if (this.isDraggingBlock) {
      return;
    }
    
    event.stopPropagation();
    this.selectedBlock = block;
    
    if (block.type === 'send-message') {
      this.showSendMessageModal = true;
    } else if (block.type === 'ask-question') {
      this.showAskQuestionModal = true;
    }
  }
  
  getBlockColor(type: string): string {
    const colors: { [key: string]: string } = {
      'start': 'bg-green-500',
      'send-message': 'bg-red-500',
      'ask-question': 'bg-orange-500',
      'set-condition': 'bg-blue-500'
    };
    return colors[type] || 'bg-gray-500';
  }
  
  getBlockBorderColor(type: string): string {
    const colors: { [key: string]: string } = {
      'start': 'border-green-500',
      'send-message': 'border-red-500',
      'ask-question': 'border-orange-500',
      'set-condition': 'border-blue-500'
    };
    return colors[type] || 'border-gray-500';
  }
  
  // Zoom controls
  zoomIn() {
    const newZoom = Math.min(this.zoomLevel * 1.2, 3);
    this.zoomLevel = newZoom;
    this.updateCanvasTransform();
  }
  
  zoomOut() {
    const newZoom = Math.max(this.zoomLevel / 1.2, 0.25);
    this.zoomLevel = newZoom;
    this.updateCanvasTransform();
  }
  
  resetZoom() {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateCanvasTransform();
  }
  
  // Track function for ngFor performance
  trackBlocks(index: number, block: FlowBlock): string {
    return block.id;
  }

  // Grid size calculation based on zoom
  getGridSize(): number {
    return Math.max(20, 25 * this.zoomLevel);
  }
} 