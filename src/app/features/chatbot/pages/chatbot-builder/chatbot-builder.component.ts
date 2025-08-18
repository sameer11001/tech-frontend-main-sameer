import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, Subject, asyncScheduler, throttleTime } from 'rxjs';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MessageNodeComponent } from './components/app-message-node/app-message-node.component';
import { FlowNodeType } from '../../../../core/models/chatbot.model';
import { NODE_CONSTANTS } from './constants/node.constants';
import { Connection, ConnectionService } from './services/connection.service';
import { DragDropService } from './services/drag-drop.service';
import { NodeManagementService } from './services/node-management.service';
import { AddNodeMenuComponent } from './components/add-node-menu/add-node-menu.component';
import { QuestionNodeComponent } from './components/app-question-node/app-question-node.component';
import { ConnectionLayerComponent } from './components/connection-layer/connection-layer.component';
import { ZoomControlsComponent } from './components/zoom-controls/zoom-controls.component';

import { Node } from '../../../../core/models/chatbot.model';
import { ZoomConfig } from './interface/node.interfaces';
import { InteractiveButtonsNodeComponent } from './components/app-interactive-buttons-node/app-interactive-buttons-node.component';
@Component({
  selector: 'app-chatbot-builder',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    MessageNodeComponent,
    QuestionNodeComponent,
    InteractiveButtonsNodeComponent,
    ZoomControlsComponent,
    ConnectionLayerComponent,
    AddNodeMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chatbot-builder.component.html',
  styleUrls: ['./chatbot-builder.component.scss'],
})
export class ChatbotBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('gridContainer', { static: true })
  gridContainer!: ElementRef<HTMLElement>;
  connectionSourceButtonIndex?: number;
  connectionSourceButtonId?: string;
  isDragging = false;
  draggedNodeId: string | null = null;
  nodes: Node[] = [];
  connections: Connection[] = [];
  zoomConfig: ZoomConfig = {
    level: 1,
    min: NODE_CONSTANTS.ZOOM.MIN,
    max: NODE_CONSTANTS.ZOOM.MAX,
    step: NODE_CONSTANTS.ZOOM.STEP,
  };
  showAddMenu = false;
  selectedNode: Node | null = null;
  selectedConnection: Connection | null = null;
  connectionDeleteButton: { x: number; y: number } | null = null;
  isConnecting = false;
  connectionSourceNode: Node | null = null;
  connectionPreviewLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null = null;
  private previewUpdateFrame: number | null = null;
  private destroy$ = new Subject<void>();

  readonly nodeOptions = [
    {
      title: 'Send message',
      type: 'message' as FlowNodeType,
      icon: 'chat',
      bgColor: 'bg-blue-500',
      iconBg: 'bg-blue-700',
    },
    {
      title: 'Question',
      type: 'question' as FlowNodeType,
      icon: 'question_answer',
      bgColor: 'bg-green-500',
      iconBg: 'bg-green-700',
    },
    {
      title: 'Buttons',
      type: 'interactive_buttons' as FlowNodeType,
      icon: 'widgets',
      bgColor: 'bg-yellow-500',
      iconBg: 'bg-yellow-700',
    },
  ];

  constructor(
    private nodeService: NodeManagementService,
    private connectionService: ConnectionService,
    private dragDropService: DragDropService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.showAddMenu = true;
    this.setupSubscriptions();
  }

ngOnDestroy(): void {
    if (this.previewUpdateFrame) {
      cancelAnimationFrame(this.previewUpdateFrame);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onZoomChange(newLevel: number): void {
    this.zoomConfig.level = Math.max(
      this.zoomConfig.min,
      Math.min(this.zoomConfig.max, newLevel)
    );
    this.cdr.markForCheck();
  }

  onAddNodeOption(option: any): void {
    const position = this.calculateNewNodePosition();
    const newNode = this.nodeService.addNode(option.type, position);
    this.closeAddMenu();
    this.cdr.markForCheck();
  }

  onNodeDelete(node: Node): void {
    this.connectionService
      .getAllConnections(this.nodes)
      .filter((conn) => conn.from.id === node.id || conn.to.id === node.id)
      .forEach((conn) =>
        this.connectionService.deleteConnection(conn.from, conn.to)
      );

    this.nodeService.deleteNode(node.id);
    this.closeAddMenu();
    this.cdr.markForCheck();
  }

  onNodeContentChange(): void {
    this.updateConnections();
  }

  openAddMenu(node?: Node): void {
    this.showAddMenu = true;
    this.selectedNode = node || null;
    this.cdr.markForCheck();
  }

  closeAddMenu(): void {
    this.showAddMenu = false;
    this.selectedNode = null;
    this.cdr.markForCheck();
  }

  onConnectionStart(sourceNode: Node, event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const customEvent = event as MouseEvent & { buttonIndex?: number; buttonId?: string };
    if (customEvent.buttonIndex !== undefined) {
      this.connectionSourceButtonIndex = customEvent.buttonIndex;
      this.connectionSourceButtonId = customEvent.buttonId;
    } else {
      this.connectionSourceButtonIndex = undefined;
      this.connectionSourceButtonId = undefined;
    }

    this.startConnectionDrag(sourceNode, event);
  }

  onConnectionClick(connection: Connection, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedConnection = connection;
    this.positionConnectionDeleteButton(connection);
    this.cdr.markForCheck();
  }

  onConnectionDelete(): void {
    if (this.selectedConnection) {
      this.connectionService.deleteConnection(
        this.selectedConnection.from,
        this.selectedConnection.to,
        this.selectedConnection.buttonIndex
      );
      this.clearConnectionSelection();
      this.updateConnections();
    }
  }

  hideConnectionButtons(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.clearConnectionSelection();
  }

  private setupSubscriptions(): void {
    this.nodeService.nodes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodes) => {
        this.nodes = nodes;
        this.updateConnections();
        this.cdr.markForCheck();
      });
    this.dragDropService.drag$
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(8, asyncScheduler, { leading: true, trailing: true })
      )
      .subscribe((dragData) => {
        if (dragData) {
          this.isDragging = dragData.isDragging;
          this.draggedNodeId = dragData.isDragging ? dragData.node.id : null;

          if (dragData.isDragging) {
            this.updateConnections();
          }
          this.cdr.detectChanges();
        } else {
          this.isDragging = false;
          this.draggedNodeId = null;
          this.cdr.markForCheck();
        }
      });
  }

  private updateConnections(): void {
    this.connections = this.connectionService.getAllConnections(this.nodes);
  }

  private calculateNewNodePosition(): { x: number; y: number } {
    if (this.nodes.length === 0) {
      return { x: 200, y: 200 };
    }

    if (this.selectedNode) {
      return {
        x: this.selectedNode.position.x + 350,
        y: this.selectedNode.position.y,
      };
    }

    return {
      x: 200 + this.nodes.length * 50,
      y: 200 + this.nodes.length * 50,
    };
  }

  private startConnectionDrag(
    sourceNode: Node,
    event: MouseEvent | TouchEvent
  ): void {
    this.isConnecting = true;
    this.connectionSourceNode = sourceNode;

    const sourcePos = this.connectionService.getConnectionPoint(sourceNode);
    if (sourcePos) {
      this.connectionPreviewLine = {
        x1: sourcePos.x,
        y1: sourcePos.y,
        x2: sourcePos.x,
        y2: sourcePos.y,
      };
    }

    this.addConnectionEventListeners();
    this.cdr.markForCheck();
  }

  private addConnectionEventListeners(): void {
    document.addEventListener('mousemove', this.onConnectionMouseMove);
    document.addEventListener('touchmove', this.onConnectionTouchMove, {
      passive: false,
    });
    document.addEventListener('mouseup', this.onConnectionMouseUp);
    document.addEventListener('touchend', this.onConnectionTouchEnd);
  }

  private removeConnectionEventListeners(): void {
    document.removeEventListener('mousemove', this.onConnectionMouseMove);
    document.removeEventListener('touchmove', this.onConnectionTouchMove);
    document.removeEventListener('mouseup', this.onConnectionMouseUp);
    document.removeEventListener('touchend', this.onConnectionTouchEnd);
  }

  private onConnectionMouseMove = (event: MouseEvent): void => {
    if (this.isConnecting && this.connectionSourceNode) {
      this.updateConnectionPreview(event.clientX, event.clientY);
    }
  };

  private onConnectionTouchMove = (event: TouchEvent): void => {
    if (this.isConnecting && this.connectionSourceNode) {
      event.preventDefault();
      const touch = event.touches[0];
      this.updateConnectionPreview(touch.clientX, touch.clientY);
    }
  };

  private onConnectionMouseUp = (event: MouseEvent): void => {
    if (this.isConnecting) {
      this.handleConnectionEnd(event.target as HTMLElement);
    }
  };

  private onConnectionTouchEnd = (event: TouchEvent): void => {
    if (this.isConnecting) {
      const touch = event.changedTouches[0];
      const targetElement = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement;
      this.handleConnectionEnd(targetElement);
    }
  };

  private updateConnectionPreview(clientX: number, clientY: number): void {
    if (!this.isConnecting || !this.connectionSourceNode || !this.gridContainer) return;

    // Cancel previous frame if it exists
    if (this.previewUpdateFrame) {
      cancelAnimationFrame(this.previewUpdateFrame);
    }

    this.previewUpdateFrame = requestAnimationFrame(() => {
      const sourcePos = this.connectionService.getConnectionPoint(
        this.connectionSourceNode!,
        this.connectionSourceButtonIndex
      );
      const containerRect = this.gridContainer.nativeElement.getBoundingClientRect();

      if (sourcePos) {
        const targetX = (clientX - containerRect.left) / this.zoomConfig.level;
        const targetY = (clientY - containerRect.top) / this.zoomConfig.level;

        this.connectionPreviewLine = {
          x1: sourcePos.x,
          y1: sourcePos.y,
          x2: targetX,
          y2: targetY,
        };
        this.cdr.detectChanges(); // Use detectChanges for immediate update
      }
    });
  }

  private handleConnectionEnd(targetElement: HTMLElement): void {
    if (!this.isConnecting || !this.connectionSourceNode) {
      this.endConnection();
      return;
    }

    const targetCard = targetElement.closest('.node-container');
    if (targetCard) {
      const targetNodeId = targetCard.getAttribute('data-node-id');
      const targetNode = this.nodeService.findNodeById(targetNodeId!);

      if (targetNode && targetNode !== this.connectionSourceNode) {
        const success = this.connectionService.createConnection(
          this.connectionSourceNode,
          targetNode,
          this.connectionSourceButtonIndex,
          this.connectionSourceButtonId
        );

        if (success) {
          this.updateConnections();
        }
      }
    }

    this.endConnection();
  }

  private endConnection(): void {
    this.isConnecting = false;
    this.connectionSourceNode = null;
    this.connectionSourceButtonIndex = undefined;
    this.connectionSourceButtonId = undefined;
    this.connectionPreviewLine = null;
    this.removeConnectionEventListeners();
    this.cdr.markForCheck();
  }

  private positionConnectionDeleteButton(connection: Connection): void {
    const fromPos = this.connectionService.getConnectionPoint(connection.from);
    const toPos = {
      x: connection.to.position.x,
      y: connection.to.position.y + 60,
    };

    if (fromPos && toPos) {
      this.connectionDeleteButton = {
        x: (fromPos.x + toPos.x) / 2,
        y: (fromPos.y + toPos.y) / 2,
      };
    }
  }

  private clearConnectionSelection(): void {
    this.selectedConnection = null;
    this.connectionDeleteButton = null;
    this.cdr.markForCheck();
  }

  trackByNodeId(index: number, node: Node): string {
    return node.id;
  }

  trackByConnection(index: number, connection: Connection): string {
    return `${connection.from.id}-${connection.to.id}`;
  }

  getTransformStyle(): string {
    return `scale(${this.zoomConfig.level})`;
  }

  getConnectionPoint(node: Node): { x: number; y: number } | null {
    return this.connectionService.getConnectionPoint(node);
  }
}
