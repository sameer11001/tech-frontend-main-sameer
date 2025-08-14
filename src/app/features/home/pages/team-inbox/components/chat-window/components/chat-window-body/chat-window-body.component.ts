import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { finalize, skip, Subscription, take } from 'rxjs';

import { Conversation } from '../../../../../../../../core/models/conversation.model';
import { MessagesService } from '../../../../../../../../core/services/messages/messages.service';
import {
  clearMessages,
  loadMessagesByConversation,
} from '../../../../../../../../core/services/messages/ngrx/messages.actions';
import {
  selectMessages,
  selectMessagesMeta,
} from '../../../../../../../../core/services/messages/ngrx/messages.selectors';

@Component({
  selector: 'app-chat-window-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-window-body.component.html',
  styleUrls: ['./chat-window-body.component.css'],
  providers: [MessagesService],
})
export class ChatWindowBodyComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() conversation!: Conversation;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  messages$ = this.store.select(selectMessages);
  meta$ = this.store.select(selectMessagesMeta);

  currentPage = 1;
  loading = false;
  hasMore = false;
  before_id: string | null = null;
  before_created_at: string | null = null;

  audioUrlMap: Record<string, SafeUrl> = {};
  loadingAudio: Record<string, boolean> = {};
  errorLoadingAudio: Record<string, boolean> = {};

  isPlaying: Record<string, boolean> = {};
  progress: Record<string, number> = {};
  currentTime: Record<string, number> = {};
  duration: Record<string, number> = {};
  private audioElements: Record<string, HTMLAudioElement> = {};

  private messagesSub?: Subscription;
  private metaSub?: Subscription;

  constructor(
    private store: Store,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private httpBackend: HttpBackend
  ) {
    this.http = new HttpClient(this.httpBackend);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['conversation'] && this.conversation?.id) {
      this.resetState();
      this.loadPage();
      this.setupSubscriptions();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    Object.values(this.audioElements).forEach((a) => {
      a.pause();
      a.src = '';
    });
  }

  onScroll() {
    const c = this.scrollContainer.nativeElement;
    const THRESHOLD = 20;

    if (c.scrollTop <= THRESHOLD && this.hasMore && !this.loading) {
      this.loading = true;
      const prevHeight = c.scrollHeight;
      const prevScrollTop = c.scrollTop;
      this.currentPage++;

      this.store.dispatch(
        loadMessagesByConversation({
          conversationId: this.conversation.id,
          before_id: this.before_id ?? null,
          before_created_at: this.before_created_at ?? null,
        })
      );

      const subscription = this.messages$
        .pipe(skip(1), take(1))
        .subscribe(() => {
          setTimeout(() => {
            const newHeight = c.scrollHeight;
            c.scrollTop = newHeight - prevHeight + prevScrollTop;
            this.loading = false;
          }, 100);
        });
    }
  }

  private resetState() {
    this.currentPage = 1;
    this.hasMore = false;
    this.before_id = null;
    this.before_created_at = null;
    this.audioUrlMap = {};
    this.loadingAudio = {};
    this.errorLoadingAudio = {};
    this.clearSubscriptions();
    this.store.dispatch(clearMessages());
  }

  private loadPage() {
    this.store.dispatch(
      loadMessagesByConversation({
        conversationId: this.conversation.id,
        before_id: null,
        before_created_at: null,
      })
    );
  }

  private setupSubscriptions() {
    this.messagesSub = this.messages$.subscribe((messages) => {
      messages.forEach((msg) => {
        if (
          msg.message_type === 'audio' &&
          msg.content?.cdn_url &&
          !this.audioUrlMap[msg._id]
        ) {
          this.fetchAudio(
            msg._id,
            msg.content.cdn_url,
            msg.content.mime_type || 'audio/mpeg'
          );
        }
      });

      if (this.currentPage === 1) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });

    this.metaSub = this.meta$.subscribe((meta) => {
      this.hasMore = !!meta?.has_more;
      this.before_id = meta?.cursor.before_id;
      this.before_created_at = meta?.cursor.before_created_at;
    });
  }

  private clearSubscriptions() {
    this.messagesSub?.unsubscribe();
    this.metaSub?.unsubscribe();
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const c = this.scrollContainer.nativeElement;
      c.scrollTop = c.scrollHeight;
    }
  }

  onTemplateButton(msg: any, index: number) {
    const payload = msg.content.template.components.filter(
      (c: any) => c.type === 'button' && c.index === index
    )[0].parameters[0].payload;
  }

  private fetchAudio(id: string, url: string, mimeType: string) {
    this.loadingAudio[id] = true;
    this.errorLoadingAudio[id] = false;

    this.http
      .get(url, { responseType: 'blob' })
      .pipe(finalize(() => (this.loadingAudio[id] = false)))
      .subscribe({
        next: (rawBlob) => {
          const typedBlob = new Blob([rawBlob], { type: mimeType });
          const objectUrl = URL.createObjectURL(typedBlob);
          this.audioUrlMap[id] =
            this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: () => {
          this.errorLoadingAudio[id] = true;
        },
      });
  }
  getTemplateView(msg: any): TemplateView {
    const comps: any[] =
      msg.content?.template?.components || msg.content?.components || [];

    const findByType = (type: string) =>
      comps.find((c) => c.type.toLowerCase() === type.toLowerCase());

    const hdr = findByType('header') || findByType('HEADER');
    const headerText = hdr?.parameters?.[0]?.text || hdr?.text || undefined;

    const b = findByType('body') || findByType('BODY');
    let bodyTexts: string[] = [];
    if (b) {
      if (Array.isArray(b.parameters) && b.parameters.length) {
        bodyTexts = b.parameters.map((p: any) => p.text);
      } else if (typeof b.text === 'string') {
        bodyTexts = [b.text];
      }
    }

    const ftr = findByType('footer') || findByType('FOOTER');
    const footerText = ftr?.parameters?.[0]?.text || ftr?.text || undefined;

    const buttons = (
      comps.filter(
        (c) => c.type.toLowerCase() === 'button' && c.sub_type === 'quick_reply'
      ) || []
    ).map((c) => ({
      text: c.parameters?.[0]?.payload,
      index: c.index,
    }));

    return { headerText, bodyTexts, footerText, buttons };
  }

  getButtonView(msg: any): ButtonView {
    const interactive = msg.content?.interactive?.button_reply;
    const text = interactive?.title || msg.content?.payload || 'Button';
    return {
      text,
      contextId: msg.context?.replied_message_id,
    };
  }

  toggleAudio(id: string) {
    const url = (this.audioUrlMap[id] as any)
      .changingThisBreaksApplicationSecurity;
    if (!this.audioElements[id]) {
      const audio = new Audio(url);
      this.audioElements[id] = audio;

      audio.addEventListener('timeupdate', () => {
        this.currentTime[id] = audio.currentTime;
        this.duration[id] = audio.duration || 0;
        this.progress[id] = audio.duration
          ? (audio.currentTime / audio.duration) * 100
          : 0;
      });
      audio.addEventListener('ended', () => {
        this.isPlaying[id] = false;
      });
    }

    const player = this.audioElements[id];
    if (this.isPlaying[id]) {
      player.pause();
      this.isPlaying[id] = false;
    } else {
      player.play();
      this.isPlaying[id] = true;
    }
  }

  formatTime(sec: number = 0): string {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  downloadAudio(id: string) {
    const url = (this.audioUrlMap[id] as any)
      .changingThisBreaksApplicationSecurity;
    const link = document.createElement('a');
    link.href = url;
    link.download = `audio-${id}.mp3`;
    link.click();
  }
}

interface TemplateView {
  headerText?: string;
  bodyTexts: string[];
  footerText?: string;
  buttons: { text: string; index: number }[];
}

interface ButtonView {
  text: string;
  contextId?: string;
}
