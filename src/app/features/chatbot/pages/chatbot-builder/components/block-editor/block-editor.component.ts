import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowBlock } from '../flow-block/flow-block.component';

interface MessageOption {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-block-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      *ngIf="block && block.isEditing"
      [style.left.px]="getEditorPosition().x"
      [style.top.px]="getEditorPosition().y"
      class="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-80">
      
      <!-- Send Message Editor -->
      <div *ngIf="block.type === 'send-message'">
        <div class="mb-4">
          <h3 class="font-medium text-gray-900 mb-3">Configure Send Message</h3>
          
          <!-- Media Type Selection -->
          <div *ngIf="!selectedMessageOption" class="grid grid-cols-3 gap-3 mb-4">
            <div 
              *ngFor="let option of messageOptions"
              (click)="selectMessageOption(option.id)"
              class="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
              <span class="text-2xl mb-2">{{ option.icon }}</span>
              <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
            </div>
          </div>
          
          <!-- Message Configuration -->
          <div *ngIf="selectedMessageOption">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">{{ getSelectedOptionLabel() }}</h4>
              <button 
                (click)="goBackToSelection()"
                class="text-sm text-blue-600 hover:text-blue-800">
                ← Back
              </button>
            </div>
            
            <!-- Message Type -->
            <div *ngIf="selectedMessageOption === 'message'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Message Text</label>
              <div class="border border-gray-300 rounded-lg overflow-hidden">
                <!-- Formatting Toolbar -->
                <div class="flex items-center space-x-2 p-2 bg-gray-50 border-b border-gray-200">
                  <button 
                    (click)="formatText('bold')"
                    class="p-1 hover:bg-gray-200 rounded text-sm font-bold">
                    B
                  </button>
                  <button 
                    (click)="formatText('italic')"
                    class="p-1 hover:bg-gray-200 rounded text-sm italic">
                    I
                  </button>
                  <button 
                    (click)="formatText('strikethrough')"
                    class="p-1 hover:bg-gray-200 rounded text-sm line-through">
                    S
                  </button>
                  <div class="border-l border-gray-300 h-4 mx-2"></div>
                  <button 
                    (click)="insertVariable('{{name}}')"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    Variables
                  </button>
                </div>
                <textarea 
                  [(ngModel)]="messageText"
                  (input)="updateBlockData()"
                  class="w-full p-3 border-0 focus:ring-0 resize-none"
                  rows="4"
                  placeholder="Type your message here..."></textarea>
              </div>
            </div>
            
            <!-- Media Types -->
            <div *ngIf="selectedMessageOption !== 'message'">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input 
                  type="file" 
                  id="fileInput" 
                  (change)="onFileSelect($event)"
                  class="hidden"
                  [attr.accept]="getAcceptType()">
                
                <div *ngIf="!uploadedFile">
                  <div class="text-4xl mb-2">{{ getSelectedOptionIcon() }}</div>
                  <p class="text-gray-600 mb-2">Drag and drop your {{ selectedMessageOption }} here</p>
                  <button 
                    (click)="document.getElementById('fileInput')?.click()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose File
                  </button>
                </div>
                
                <div *ngIf="uploadedFile" class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">{{ uploadedFile.name }}</span>
                  <button 
                    (click)="deleteUploadedFile()"
                    class="text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              </div>
              
              <!-- Caption for media -->
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
                <input 
                  type="text" 
                  [(ngModel)]="caption"
                  (input)="updateBlockData()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a caption...">
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button 
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            (click)="onSave()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Done
          </button>
        </div>
      </div>
      
      <!-- Other block types can be added here -->
      <div *ngIf="block.type === 'ask-question'">
        <h3 class="font-medium text-gray-900 mb-3">Configure Ask Question</h3>
        <p class="text-sm text-gray-600 mb-4">Question configuration coming soon...</p>
        <button 
          (click)="onCancel()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Done
        </button>
      </div>
      
      <div *ngIf="block.type === 'set-condition'">
        <h3 class="font-medium text-gray-900 mb-3">Configure Set Condition</h3>
        <p class="text-sm text-gray-600 mb-4">Condition configuration coming soon...</p>
        <button 
          (click)="onCancel()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Done
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class BlockEditorComponent implements OnChanges {
  @Input() block: FlowBlock | null = null;
  @Input() canvasScale = 1;
  @Input() canvasPosition = { x: 0, y: 0 };

  @Output() save = new EventEmitter<FlowBlock>();
  @Output() cancel = new EventEmitter<void>();

  // Form data
  selectedMessageOption = '';
  messageText = '';
  caption = '';
  uploadedFile: File | null = null;

  messageOptions: MessageOption[] = [
    { id: 'message', label: 'Message', icon: '💬' },
    { id: 'image', label: 'Image', icon: '📷' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'document', label: 'Document', icon: '📄' }
  ];

  document = document;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['block'] && this.block?.isEditing) {
      this.initializeForm();
    }
  }

  initializeForm() {
    if (!this.block) return;
    
    // Initialize form data from block data
    this.selectedMessageOption = this.block.data?.messageType || '';
    this.messageText = this.block.data?.content || '';
    this.caption = this.block.data?.caption || '';
    this.uploadedFile = this.block.data?.file || null;
  }

  getEditorPosition() {
    if (!this.block) return { x: 0, y: 0 };
    
    // Position the editor next to the block
    const blockX = this.block.x * this.canvasScale + this.canvasPosition.x;
    const blockY = this.block.y * this.canvasScale + this.canvasPosition.y;
    
    return {
      x: blockX + 250, // Position to the right of the block
      y: blockY
    };
  }

  selectMessageOption(optionId: string) {
    this.selectedMessageOption = optionId;
    this.updateBlockData();
  }

  goBackToSelection() {
    this.selectedMessageOption = '';
    this.messageText = '';
    this.caption = '';
    this.uploadedFile = null;
  }

  updateBlockData() {
    if (!this.block) return;
    
    if (!this.block.data) {
      this.block.data = {};
    }
    
    this.block.data.messageType = this.selectedMessageOption;
    this.block.data.content = this.messageText;
    this.block.data.caption = this.caption;
    this.block.data.file = this.uploadedFile;
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.uploadedFile = target.files[0];
      this.updateBlockData();
    }
  }

  deleteUploadedFile() {
    this.uploadedFile = null;
    this.updateBlockData();
  }

  formatText(command: string) {
    // Simple text formatting (could be enhanced with a rich text editor)
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.messageText.substring(start, end);
      
      let formattedText = selectedText;
      switch (command) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'strikethrough':
          formattedText = `~~${selectedText}~~`;
          break;
      }
      
      this.messageText = this.messageText.substring(0, start) + formattedText + this.messageText.substring(end);
      this.updateBlockData();
    }
  }

  insertVariable(variable: string) {
    this.messageText += variable;
    this.updateBlockData();
  }

  getSelectedOptionLabel(): string {
    const option = this.messageOptions.find(opt => opt.id === this.selectedMessageOption);
    return option?.label || '';
  }

  getSelectedOptionIcon(): string {
    const option = this.messageOptions.find(opt => opt.id === this.selectedMessageOption);
    return option?.icon || '';
  }

  getAcceptType(): string {
    switch (this.selectedMessageOption) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '*/*';
    }
  }

  onSave() {
    if (this.block) {
      this.save.emit(this.block);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 