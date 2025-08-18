// media-type-upload.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-media-type-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-type-upload.component.html',
  styles: [`
    .preview-container {
      margin-top: 0.5rem;
    }

    .file-input-hidden {
      position: absolute;
      left: -9999px;
      opacity: 0;
    }

    .upload-button {
      transition: all 0.2s ease-in-out;
    }

    .upload-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class MediaTypeUploadComponent {
  @Input() mediaType!: string;
  @Input() form!: FormGroup;
  @Input() selectedMedia: { [key: string]: File | null } = {};
  @Input() mediaPreviewUrls: { [key: string]: string | null } = {};
  @Input() previewMediaType: string = '';

  @Output() mediaSelected = new EventEmitter<{event: Event, mediaType: string}>();

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      this.mediaSelected.emit({ event, mediaType: this.mediaType });
    }
  }

  onUrlInputChange(event: Event): void {
    // Optional: Handle URL input changes
    const target = event.target as HTMLInputElement;
    if (target?.value) {
      // You might want to emit an event for URL changes too
      console.log(`URL entered for ${this.mediaType}:`, target.value);
    }
  }

  getAcceptString(): string {
    switch (this.mediaType) {
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'video':
        return 'video/mp4,video/avi,video/mov,video/wmv';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf';
      default:
        return '';
    }
  }

  getPreviewContent(): boolean {
    return !!(this.mediaPreviewUrls[this.mediaType] || this.selectedMedia[this.mediaType]);
  }

  getMaxFileSize(): string {
    switch (this.mediaType) {
      case 'image': return '5MB';
      case 'video': return '50MB';
      case 'document': return '10MB';
      default: return '';
    }
  }

  clearMedia(): void {
    // Optional method to clear selected media
    const clearEvent = {
      event: new Event('clear'),
      mediaType: this.mediaType
    };
    this.mediaSelected.emit(clearEvent);
  }

  // Helper method to get file size in readable format
  getFileSize(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
