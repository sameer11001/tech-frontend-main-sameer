import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeValidators } from '../../validators/node.validators';
import { BaseNodeComponent } from '../base/base-node.component';
import { DragDropService } from './../../services/drag-drop.service';
import { ContentItem } from '../../../../../../core/models/chatbot.model';
import { ContentType } from '../../types/events.types';
import { ContentTypeButtonsComponent } from './../../shared/content-type-buttonts/content-type-buttons.component';
import { ContentItemsListComponent } from './../../shared/content-items/content-items.component';
import { NodeHeaderComponent } from './../../shared/node-header/node-header.component';
import { ConnectionButtonComponent } from './../../shared/connection-button.component';

@Component({
  selector: 'app-message-node',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentTypeButtonsComponent,
    ContentItemsListComponent,
    NodeHeaderComponent,
    ConnectionButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-message-node.component.html',
  styleUrls: ['./app-message-node.component.css'],
})
export class MessageNodeComponent extends BaseNodeComponent implements OnInit {
  constructor(
    dragDropService: DragDropService,
    override cdr: ChangeDetectorRef
  ) {
    super(dragDropService, cdr);
  }

  protected initializeNode(): void {
    if (!this.node.body.bodyMessage) {
      this.node.body.bodyMessage = { content_items: [] };
    }
  }

  getContentItems(): ContentItem[] {
    return this.node.body.bodyMessage?.content_items || [];
  }

  addContentType(type: ContentType): void {
    if (!this.node.body.bodyMessage) {
      this.node.body.bodyMessage = { content_items: [] };
    }

    const newItem: ContentItem = {
      type,
      order: this.node.body.bodyMessage.content_items.length,
      content: this.createContentByType(type),
    };

    this.node.body.bodyMessage.content_items.push(newItem);
    this.emitContentChange();
    this.cdr.markForCheck();
  }

  onContentItemsChange(items: ContentItem[]): void {
    if (this.node.body.bodyMessage) {
      this.node.body.bodyMessage.content_items = items;
      this.emitContentChange();
    }
  }

  private createContentByType(type: ContentType): any {
    if (type === 'text') {
      return { text_body: '' };
    }
    return {
      file_name: '',
      bytes: '',
      mime_type: `${type}/*`,
    };
  }
}
