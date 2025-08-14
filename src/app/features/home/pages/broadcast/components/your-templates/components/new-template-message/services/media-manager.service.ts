import { Injectable } from '@angular/core';
import { ToastService } from '../../../../../../../../../core/services/toast-message.service';
import { TemplateConstants } from './template-constants.service';

export interface MediaState {
  selectedMedia: { [key: string]: File | null };
  mediaPreviewUrls: { [key: string]: string | null };
}

export interface MediaValidation {
  isValid: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaManagerService {
  private state: MediaState = {
    selectedMedia: {
      image: null,
      video: null,
      document: null,
    },
    mediaPreviewUrls: {
      image: null,
      video: null,
      document: null,
    }
  };

  private readonly allowedTypes = {
    image: TemplateConstants.ALLOWED_IMAGE_TYPES,
    video: TemplateConstants.ALLOWED_VIDEO_TYPES,
    document: TemplateConstants.ALLOWED_DOCUMENT_TYPES
  };

  constructor(private toastService: ToastService) {}

  getState(): MediaState {
    return { ...this.state };
  }

  validateFile(file: File, mediaType: string): MediaValidation {
    // Validate file size
    if (file.size > TemplateConstants.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than 16MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    // Validate file type
    const allowedTypes = this.allowedTypes[mediaType as keyof typeof this.allowedTypes];
    if (!allowedTypes || !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type for ${mediaType}. Allowed types: ${allowedTypes?.join(', ')}`
      };
    }

    return { isValid: true };
  }

  selectMedia(file: File, mediaType: string): void {
    const validation = this.validateFile(file, mediaType);
    if (!validation.isValid) {
      this.toastService.showToast(validation.error!, 'error');
      return;
    }

    // Clear previous media
    this.clearPreviousMedia();

    // Set new media
    this.state.selectedMedia[mediaType] = file;
    this.updateMediaPreview(mediaType, file);
  }

  private updateMediaPreview(mediaType: string, file: File): void {
    // Clean up previous object URL if it exists
    if (this.state.mediaPreviewUrls[mediaType]) {
      if (mediaType === 'image' || mediaType === 'video') {
        URL.revokeObjectURL(this.state.mediaPreviewUrls[mediaType]!);
      }
    }
    
    // Create object URL for preview
    if (mediaType === 'image' || mediaType === 'video') {
      this.state.mediaPreviewUrls[mediaType] = URL.createObjectURL(file);
    } else if (mediaType === 'document') {
      // For documents, create a special URL format
      this.state.mediaPreviewUrls[mediaType] = `document://${file.name}`;
    }
  }

  clearPreviousMedia(): void {
    // Clean up existing object URLs
    Object.entries(this.state.mediaPreviewUrls).forEach(([type, url]) => {
      if (url && (type === 'image' || type === 'video')) {
        URL.revokeObjectURL(url);
      }
    });

    // Clear all media selections
    this.state.selectedMedia = {
      image: null,
      video: null,
      document: null,
    };
    this.state.mediaPreviewUrls = {
      image: null,
      video: null,
      document: null,
    };
  }

  getPreviewMediaUrl(broadcastTitle: string): string {
    if (broadcastTitle && broadcastTitle !== TemplateConstants.BROADCAST_TYPES.NONE && broadcastTitle !== TemplateConstants.BROADCAST_TYPES.TEXT) {
      const mediaType = broadcastTitle.toLowerCase();
      return this.state.mediaPreviewUrls[mediaType] || '';
    }
    return '';
  }

  getPreviewMediaType(broadcastTitle: string): 'image' | 'video' | 'document' | '' {
    if (broadcastTitle && broadcastTitle !== TemplateConstants.BROADCAST_TYPES.NONE && broadcastTitle !== TemplateConstants.BROADCAST_TYPES.TEXT) {
      const mediaType = broadcastTitle.toLowerCase();
      if (mediaType === 'image' || mediaType === 'video' || mediaType === 'document') {
        return mediaType;
      }
    }
    return '';
  }

  getSelectedMedia(mediaType: string): File | null {
    return this.state.selectedMedia[mediaType] || null;
  }

  hasMediaForType(broadcastTitle: string): boolean {
    if (broadcastTitle === TemplateConstants.BROADCAST_TYPES.NONE || broadcastTitle === TemplateConstants.BROADCAST_TYPES.TEXT) {
      return false;
    }
    const mediaType = broadcastTitle.toLowerCase();
    return !!this.state.selectedMedia[mediaType];
  }

  cleanup(): void {
    // Clean up object URLs to prevent memory leaks
    Object.entries(this.state.mediaPreviewUrls).forEach(([type, url]) => {
      if (url && (type === 'image' || type === 'video')) {
        URL.revokeObjectURL(url);
      }
    });
  }
} 