import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Node } from '../../../../../../core/models/chatbot.model';
import { DragDropService } from './../../services/drag-drop.service';
import { NODE_CONSTANTS } from '../../constants/node.constants';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseNodeComponent implements OnInit, OnDestroy {
  @Input() node!: Node;
  @Input() isDragging = false;
  @Input() zoomLevel = 1;

  @Output() onConnectionStart = new EventEmitter<MouseEvent | TouchEvent>();
  @Output() onAddNode = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onContentChange = new EventEmitter<void>();

  protected destroy$ = new Subject<void>();
  protected longPressTimer: any = null;
  protected longPressStarted = false;
  protected dragThreshold = 5; // pixels
  protected startPosition = { x: 0, y: 0 };

  constructor(
    protected dragDropService: DragDropService,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeNode();
    this.setupDragSubscription();
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDragSubscription(): void {
    this.dragDropService.drag$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dragData) => {
        if (dragData?.node.id === this.node.id) {
          this.isDragging = dragData.isDragging;
          this.cdr.markForCheck();
        }
      });
  }

  onMouseDown(event: MouseEvent): void {
    if (this.shouldIgnoreEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    this.startPosition = { x: event.clientX, y: event.clientY };
    this.startLongPress(event);
  }

  onTouchStart(event: TouchEvent): void {
    if (this.shouldIgnoreEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    this.startPosition = { x: touch.clientX, y: touch.clientY };
    this.startLongPress(event);
  }

  protected shouldIgnoreEvent(event: Event): boolean {
    const target = event.target as HTMLElement;
    return (
      this.isInteractiveElement(target) ||
      !!target.closest('.connection-button') ||
      !!target.closest('button') ||
      !!target.closest('input') ||
      !!target.closest('textarea') ||
      !!target.closest('select')
    );
  }

  protected isInteractiveElement(element: HTMLElement): boolean {
    const interactiveSelectors = [
      'input',
      'textarea',
      'select',
      'button',
      '[contenteditable]',
      '.interactive-element',
      '.connection-button',
    ];

    return interactiveSelectors.some(
      (selector) => element.matches(selector) || element.closest(selector)
    );
  }

  protected startLongPress(event: MouseEvent | TouchEvent): void {
    this.longPressStarted = false;

    // Shorter delay for more responsive feel
    this.longPressTimer = setTimeout(() => {
      this.longPressStarted = true;
      this.dragDropService.startDrag(this.node, event, this.zoomLevel);
    }, 150); // Reduced from 500ms to 150ms

    this.addLongPressCancelListeners();
  }

  protected addLongPressCancelListeners(): void {
    const cancelLongPress = (event?: Event) => {
      if (event && this.hasMovedBeyondThreshold(event)) {
        return; // Don't cancel if user is already dragging
      }

      this.clearLongPressTimer();
      this.removeLongPressCancelListeners();
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (this.hasMovedBeyondThreshold(event) && !this.longPressStarted) {
        // Start drag immediately if user moves beyond threshold
        this.clearLongPressTimer();
        this.longPressStarted = true;
        this.dragDropService.startDrag(this.node, event, this.zoomLevel);
      }
    };

    document.addEventListener('mouseup', cancelLongPress, { once: true });
    document.addEventListener('touchend', cancelLongPress, { once: true });
    document.addEventListener('touchcancel', cancelLongPress, { once: true });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);

    // Store references for cleanup
    this.moveHandler = handleMove;
  }

  private moveHandler: any = null;

  protected removeLongPressCancelListeners(): void {
    if (this.moveHandler) {
      document.removeEventListener('mousemove', this.moveHandler);
      document.removeEventListener('touchmove', this.moveHandler);
      this.moveHandler = null;
    }
  }

  protected hasMovedBeyondThreshold(event: Event): boolean {
    let clientX = 0,
      clientY = 0;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX ?? 0;
      clientY = event.touches[0]?.clientY ?? 0;
    }

    const deltaX = Math.abs(clientX - this.startPosition.x);
    const deltaY = Math.abs(clientY - this.startPosition.y);

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this.dragThreshold;
  }

  protected clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  protected cleanup(): void {
    this.clearLongPressTimer();
    this.removeLongPressCancelListeners();
  }

  protected abstract initializeNode(): void;

  protected getConnectionsCount(): {
    incoming: number;
    outgoing: number;
    maxOutgoing: number;
  } {
    const incoming = this.node.parents?.length || 0;
    const outgoing = this.node.children.filter(
      (child) => child !== null
    ).length;
    const maxOutgoing = this.getMaxOutgoingConnections();

    return { incoming, outgoing, maxOutgoing };
  }

  protected getMaxOutgoingConnections(): number {
    if (this.node.type === 'interactive_buttons') {
      return this.node.body.bodyButton?.action?.buttons?.length || 0;
    }
    return 1;
  }

  protected emitContentChange(): void {
    this.onContentChange.emit();
  }
}
