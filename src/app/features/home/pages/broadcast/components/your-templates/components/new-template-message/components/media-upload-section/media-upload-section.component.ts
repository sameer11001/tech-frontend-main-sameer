// media-upload-section.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MediaTypeUploadComponent } from '../media-type-upload/media-type-upload.component';

@Component({
  selector: 'app-media-upload-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MediaTypeUploadComponent],
  templateUrl: './media-upload-section.component.html',
})
export class MediaUploadSectionComponent {
  @Input() form!: FormGroup;
  @Input() broadcastOptions: string[] = [];
  @Input() selectedMedia: { [key: string]: File | null } = {};
  @Input() mediaPreviewUrls: { [key: string]: string | null } = {};
  @Input() previewMediaType: string = '';

  @Output() broadcastTitleChange = new EventEmitter<Event>();
  @Output() mediaSelected = new EventEmitter<{event: Event, mediaType: string}>();

  onBroadcastTitleChange(event: Event): void {
    this.broadcastTitleChange.emit(event);
  }

  onMediaSelected(data: {event: Event, mediaType: string}): void {
    this.mediaSelected.emit(data);
  }
}
