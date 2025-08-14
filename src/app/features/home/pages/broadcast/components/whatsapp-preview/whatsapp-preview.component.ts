import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

export interface WhatsAppButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

@Component({
  selector: 'app-whatsapp-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-preview.component.html',
})
export class WhatsAppPreviewComponent implements OnChanges, AfterViewInit {
  @Input() header: string = '';
  @Input() body: string = '';
  @Input() footer: string = '';
  @Input() mediaUrl: string = '';
  @Input() mediaType: 'image' | 'video' | 'document' | '' = '';
  @Input() time: string = '';
  @Input() buttons: WhatsAppButton[] = [];

  videoDuration: string = '';
  fileSize: string = '';
  documentFileSize: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaType'] || changes['mediaUrl']) {
      if (this.mediaType === 'video') {
        this.videoDuration = this.getDeterministicVideoDuration(this.mediaUrl);
      } else {
        this.videoDuration = '';
      }
      
      if (this.mediaType === 'document' && this.mediaUrl) {
        this.documentFileSize = this.getDeterministicFileSize(this.mediaUrl);
      } else {
        this.documentFileSize = '';
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.mediaType === 'video' && this.mediaUrl) {
      this.videoDuration = this.getDeterministicVideoDuration(this.mediaUrl);
    }
  }
  isImage(url: string): boolean {
    if (!url) return false;
    return this.mediaType === 'image';
  }
  
  isVideo(url: string): boolean {
    if (!url) return false;
    return this.mediaType === 'video';
  }

  isDocument(url: string): boolean {
    if (!url) return false;
    
    return this.mediaType === 'document';
  }

  getDocumentName(url: string): string {
    if (url.startsWith('document://')) {
      return url.replace('document://', '');
    }
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Document';
  }

  getDocumentType(url: string): string {
    const name = this.getDocumentName(url).toLowerCase();
    if (name.endsWith('.pdf')) return 'PDF Document';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return 'Word Document';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'Excel Document';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'PowerPoint Document';
    return 'Document';
  }

  getFileSize(): string {
    return this.documentFileSize;
  }

  private getDeterministicFileSize(mediaUrl: string): string {
    const sizes = ['1.2 MB', '2.5 MB', '856 KB', '3.1 MB', '1.8 MB'];
    let hash = 0;
    for (let i = 0; i < mediaUrl.length; i++) {
      const char = mediaUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return sizes[Math.abs(hash) % sizes.length];
  }

  getVideoDuration(): string {
    return this.videoDuration;
  }

  private getDeterministicVideoDuration(mediaUrl: string): string {
    const durations = ['0:15', '0:30', '1:24', '2:15', '0:45'];
    let hash = 0;
    for (let i = 0; i < mediaUrl.length; i++) {
      const char = mediaUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return durations[Math.abs(hash) % durations.length];
  }

  getButtonIcon(type: string): string {
    switch (type) {
      case 'QUICK_REPLY':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
      case 'URL':
        return 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14';
      case 'PHONE_NUMBER':
        return 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z';
      default:
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
    }
  }

  getButtonClass(type: string): string {
    switch (type) {
      case 'QUICK_REPLY':
        return 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50';
      case 'URL':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'PHONE_NUMBER':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  }

  getButtonTextClass(type: string): string {
    switch (type) {
      case 'QUICK_REPLY':
        return 'text-gray-800';
      case 'URL':
      case 'PHONE_NUMBER':
        return 'text-white';
      default:
        return 'text-white';
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    
    // If the current URL is already the local asset, don't try other fallbacks
    if (img.src.includes('image_notFound.png') || img.src.includes('assets/features/image_notFound.png')) {
      console.log('Already using local asset fallback');
      return;
    }
    
    // Try multiple fallback services in case one fails
    const fallbackUrls = [
      'https://picsum.photos/300/200?random=' + Math.random(),
      'https://dummyimage.com/300x200/cccccc/666666&text=Image+Not+Found',
      'assets/features/image_notFound.png' // Local asset fallback
    ];
    
    // If this is the first error, try the first fallback
    if (!img.dataset['fallbackAttempt']) {
      img.dataset['fallbackAttempt'] = '1';
      img.src = fallbackUrls[0];
    } else if (img.dataset['fallbackAttempt'] === '1') {
      // If first fallback failed, try second
      img.dataset['fallbackAttempt'] = '2';
      img.src = fallbackUrls[1];
    } else {
      // If all else fails, use the local asset
      img.src = fallbackUrls[2];
    }
  }

  onImageLoad(event: Event): void {
    // Image loaded successfully
    console.log('Image loaded successfully');
  }
} 