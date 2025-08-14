import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-message-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-message-modal.component.html',
  styleUrl: './send-message-modal.component.css'
})
export class SendMessageModalComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  
  selectedOption = '';
  messageText = '';
  mediaFile: File | null = null;
  caption = '';
  
  messageOptions = [
    { id: 'message', label: 'Message', icon: '💬' },
    { id: 'image', label: 'Image', icon: '📷' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'document', label: 'Document', icon: '📄' }
  ];
  
  selectOption(optionId: string) {
    this.selectedOption = optionId;
  }
  
  onFileSelected(event: any) {
    this.mediaFile = event.target.files[0];
  }
  
  closeModal() {
    this.close.emit();
  }
  
  save() {
    // Handle save logic here
    this.closeModal();
  }
} 