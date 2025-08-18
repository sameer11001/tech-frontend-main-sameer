import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentItem } from '../../../../../../core/models/chatbot.model';

@Component({
  selector: 'app-content-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-item.component.html',
})
export class ContentItemComponent {
  @Input() item!: ContentItem;
  @Input() index!: number;

  @Output() remove = new EventEmitter<number>();
  @Output() change = new EventEmitter<void>();

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.item.content.file_name = file.name;
      this.item.content.mime_type = file.type;

      // Create preview for images
      if (this.item.type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.item.content.preview_url = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.change.emit();
    }
  }

  getContentTypeIcon(type: string): string {
    switch (type) {
      case 'text': return 'chat';
      case 'image': return 'image';
      case 'video': return 'videocam';
      case 'audio': return 'mic';
      case 'document': return 'description';
      default: return 'attach_file';
    }
  }

  getContentTypeIconClass(type: string): string {
    switch (type) {
      case 'text': return 'text-green-600';
      case 'image': return 'text-blue-600';
      case 'video': return 'text-purple-600';
      case 'audio': return 'text-orange-600';
      case 'document': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  getFileAccept(type: string): string {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
      default: return '*/*';
    }
  }
}
