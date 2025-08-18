import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Connection } from './../../services/connection.service';
import { Node } from './../../../../../../core/models/chatbot.model';
@Component({
  selector: 'app-connection-layer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './connection-layer.component.html',
})
export class ConnectionLayerComponent {
  @Input() connections: Connection[] = [];
  @Input() previewLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null = null;
  @Input() deleteButton: { x: number; y: number } | null = null;

  @Output() connectionClick = new EventEmitter<{
    connection: Connection;
    event: MouseEvent;
  }>();
  @Output() deleteConnection = new EventEmitter<void>();

  trackByConnection(index: number, connection: Connection): string {
    return `${connection.from.id}-${connection.to.id}`;
  }
  getButtonLabel(connection: Connection): string {
    if (
      connection.from.type === 'interactive_buttons' &&
      connection.buttonIndex !== undefined
    ) {
      const button =
        connection.from.body.bodyButton?.action?.buttons?.[
          connection.buttonIndex
        ];
      return button?.reply?.title || `Button ${connection.buttonIndex + 1}`;
    }
    return '';
  }
  private getButtonConnectionPoint(
    node: Node,
    buttonIndex: number
  ): { x: number; y: number } {
    const cardWidth = 384; // Interactive buttons node width
    const buttonHeight = 32;
    const buttonSpacing = 12;
    const buttonsStartY = 280; // Approximate Y offset where buttons start in the form

    const buttonY =
      buttonsStartY + buttonIndex * (buttonHeight + buttonSpacing);

    return {
      x: node.position.x + cardWidth,
      y: node.position.y + buttonY + buttonHeight / 2,
    };
  }

  getConnectionStartPoint(
    connection: Connection
  ): { x: number; y: number } | null {
    if (
      connection.from.type === 'interactive_buttons' &&
      connection.buttonIndex !== undefined
    ) {
      return this.getButtonConnectionPoint(
        connection.from,
        connection.buttonIndex
      );
    }

    const cardWidth =
      connection.from.type === 'interactive_buttons' ? 384 : 320;
    const cardHeight = 120;
    return {
      x: connection.from.position.x + cardWidth,
      y: connection.from.position.y + cardHeight / 2,
    };
  }

  getConnectionColor(connection: Connection): string {
    if (connection.buttonIndex !== undefined) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Orange
      return colors[connection.buttonIndex] || '#6b7280';
    }
    return '#6b7280'; // Default gray
  }
  getConnectionEndPoint(
    connection: Connection
  ): { x: number; y: number } | null {
    return {
      x: connection.to.position.x,
      y: connection.to.position.y + 60,
    };
  }
}
