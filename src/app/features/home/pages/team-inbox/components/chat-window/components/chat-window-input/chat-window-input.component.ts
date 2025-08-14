import {
  Component,
  Input,
  NgZone,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  sendTextMessage,
  sendMediaMessage,
  sendLocationMessage,
  sendTemplateMessage,
  addLocalMessage,
} from '../../../../../../../../core/services/messages/ngrx/messages.actions';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../../../../../core/services/toast-message.service';

import { v4 as uuidv4 } from 'uuid';
import { map, Observable } from 'rxjs';
import {
  TemplateResponse,
  WhatsAppTemplate,
} from '../../../../../../../../core/models/whatsapp-twmplate.model';
import { loadTemplates } from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.actions';
import {
  selectTemplateLoading,
  selectTemplates,
} from '../../../../../../../../core/services/broadcast/template/ngrx/your-template.selectors';

@Component({
  standalone: true,
  selector: 'app-chat-window-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-window-input.component.html',
})
export class ChatWindowInputComponent implements OnInit, OnChanges {
  messageBody = '';
  @Input() recipientNumber!: string;
  @Input() contextMessageId: string | null = null;
  @Input() isExpired: boolean = false;
  @Input() conversationId: string | null = null;

  templates$!: Observable<WhatsAppTemplate[]>;
  loading$!: Observable<boolean>;
  showTemplatePicker = false;
  selectedTemplate: WhatsAppTemplate | null = null;

  previewData: {
    type: 'video' | 'image' | 'document' | 'location' | null;
    file?: File;
    caption?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
  } = { type: null };

  constructor(
    private store: Store,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isExpired']) {
      this.isExpired = changes['isExpired'].currentValue;
    }
  }
  ngOnInit(): void {
    this.store.dispatch(loadTemplates({ page_number: 1, limit: 10 }));

    this.templates$ = this.store
      .select(selectTemplates)
      .pipe(map((resp: TemplateResponse | null) => (resp ? resp.data : [])));
    this.loading$ = this.store.select(selectTemplateLoading);
  }

  sendText() {
    const body = this.messageBody.trim();
    if (!body) return;
    const messageId = uuidv4();
    const newMsg = {
      conversationId: this.conversationId,
      client_message_id: messageId,
      message_type: 'text',
      message_status: 'loading',
      content: {
        text: body,
      },
      recipient_number: this.recipientNumber,
      context_message_id: this.contextMessageId,
      created_at: new Date().toISOString(),
    };
    this.store.dispatch(addLocalMessage({ message: newMsg }));
    this.store.dispatch(
      sendTextMessage({
        messageBody: body,
        recipientNumber: this.recipientNumber,
        contextMessageId: this.contextMessageId,
        client_message_id: messageId,
      })
    );
    this.messageBody = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.zone.run(() => {
        this.previewData = {
          type: 'document',
          file,
          caption: '',
        };
        this.cdr.detectChanges();
      });
    }
    input.value = '';
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  sendLocation() {
    if (!navigator.geolocation) {
      this.toastService.showToast('Geolocation not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      this.zone.run(() => {
        this.previewData = {
          type: 'location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: '',
          address: '',
        };
        this.cdr.detectChanges();
      });
    });
  }

  submitPreview() {
    if ((this.previewData.type === 'document' || this.previewData.type === 'image' || this.previewData.type === 'video') && this.previewData.file) {
      const messageId = uuidv4();
      const newMsg = {
        conversationId: this.conversationId,
        client_message_id: messageId,
        message_type: this.previewData.type,
        message_status: 'loading',
        content: {
          media: this.previewData.file,
        },
        recipient_number: this.recipientNumber,
        context_message_id: this.contextMessageId,
        created_at: new Date().toISOString(),
      };
      this.store.dispatch(addLocalMessage({ message: newMsg }));
      this.store.dispatch(
        sendMediaMessage({
          recipientNumber: this.recipientNumber,
          file: this.previewData.file!,
          contextMessageId: this.contextMessageId,
          caption: this.previewData.caption || null,
          mediaLink: this.previewData.file!.name,
          client_message_id: messageId,
        })
      );
    } else if (
      this.previewData.type === 'location' &&
      this.previewData.latitude != null &&
      this.previewData.longitude != null
    ) {
      const messageId = uuidv4();
      this.store.dispatch(addLocalMessage({
        message: {
          client_message_id: uuidv4(),
          message_type: 'location',
          message_status: 'loading',
          content: {
            location: {
              latitude: this.previewData.latitude,
              longitude: this.previewData.longitude,
              name: this.previewData.name || '',
              address: this.previewData.address || '',
            },
          },
          recipient_number: this.recipientNumber,
          context_message_id: this.contextMessageId,
          created_at: new Date().toISOString(),
        },
      }));
      this.store.dispatch(
        sendLocationMessage({
          recipientNumber: this.recipientNumber,
          latitude: this.previewData.latitude,
          longitude: this.previewData.longitude,
          name: this.previewData.name || null,
          address: this.previewData.address || null,
          contextMessageId: this.contextMessageId,
          client_message_id: messageId,
        })
      );
    }
    this.previewData = { type: null };
    this.cdr.detectChanges();
  }

  cancelPreview() {
    this.previewData = { type: null };
    this.cdr.detectChanges();
  }

  openTemplatePicker() {
    this.showTemplatePicker = true;
  }

  chooseTemplate(template: WhatsAppTemplate) {
    this.selectedTemplate = template;
  }

  sendTemplate(): void {
    if (!this.selectedTemplate) return;
    const messageId = uuidv4();
    const newMsg = {
      conversationId: this.conversationId,
      client_message_id: messageId,
      message_type: 'text',
      content: {
        text: `Template: ${this.selectedTemplate.name}`,
      },
      message_status: 'loading',
      recipient_number: this.recipientNumber,
      context_message_id: this.contextMessageId,
      created_at: new Date().toISOString(),
    };
    this.store.dispatch(addLocalMessage({ message: newMsg }));
    this.store.dispatch(
      sendTemplateMessage({
        recipientNumber: this.recipientNumber,
        templateId: this.selectedTemplate?._id || '',
        parameters: [],
        client_message_id: messageId,
      })
    );
    this.resetTemplatePicker();
  }

  cancelTemplate() {
    this.resetTemplatePicker();
  }

  private resetTemplatePicker() {
    this.showTemplatePicker = false;
    this.selectedTemplate = null;
  }
}
