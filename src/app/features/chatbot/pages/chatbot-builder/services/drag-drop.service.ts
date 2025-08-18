import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Node } from '../../../../../core/models/chatbot.model';

export interface DragData {
  node: Node;
  isDragging: boolean;
  offset: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  private dragSubject = new BehaviorSubject<DragData | null>(null);
  private currentDrag: DragData | null = null;
  private animationFrameId: number | null = null;
  private lastUpdateTime = 0;
  private rafId: number | null = null;
  private pendingUpdate = false;
  drag$ = this.dragSubject.asObservable();

  startDrag(node: Node, event: MouseEvent | TouchEvent, zoomLevel: number = 1): void {
    const { clientX, clientY } = this.getEventCoordinates(event);
    const target = event.target as HTMLElement;
    const nodeElement = target.closest('.node-container') as HTMLElement;

    let offset = { x: 0, y: 0 };
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      offset = {
        x: (clientX - rect.left) / zoomLevel,
        y: (clientY - rect.top) / zoomLevel
      };
    }

    this.currentDrag = {
      node,
      isDragging: true,
      offset,
      currentPosition: { x: node.position.x, y: node.position.y }
    };

    // Add dragging class immediately for visual feedback
    if (nodeElement) {
      nodeElement.classList.add('dragging', 'no-transition');
    }

    this.dragSubject.next(this.currentDrag);
    this.addEventListeners(zoomLevel);
  }

 updateDragPosition(clientX: number, clientY: number, zoomLevel: number = 1): void {
    if (!this.currentDrag) return;

    // Use RAF to batch position updates
    if (!this.pendingUpdate) {
      this.pendingUpdate = true;

      this.rafId = requestAnimationFrame(() => {
        this.performDragUpdate(clientX, clientY, zoomLevel);
        this.pendingUpdate = false;
      });
    }
  }
private performDragUpdate(clientX: number, clientY: number, zoomLevel: number): void {
    if (!this.currentDrag) return;

    const gridContainer = document.querySelector('.transition-transform') as HTMLElement;
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    const gridX = (clientX - containerRect.left) / zoomLevel - this.currentDrag.offset.x;
    const gridY = (clientY - containerRect.top) / zoomLevel - this.currentDrag.offset.y;

    // Smooth positioning without snap during drag
    const newX = Math.max(0, gridX);
    const newY = Math.max(0, gridY);

    // Update position immediately for smooth dragging
    this.currentDrag.node.position.x = newX;
    this.currentDrag.node.position.y = newY;
    this.currentDrag.currentPosition = { x: newX, y: newY };

    // Emit update for live connection line updates
    this.dragSubject.next(this.currentDrag);

    // Use transform for immediate visual feedback (hardware accelerated)
    const nodeElement = document.querySelector(`[data-node-id="${this.currentDrag.node.id}"]`) as HTMLElement;
    if (nodeElement) {
      // Use transform3d for better performance
      nodeElement.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }
  }
endDrag(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.currentDrag) {
      const nodeElement = document.querySelector(`[data-node-id="${this.currentDrag.node.id}"]`) as HTMLElement;

      // Snap to grid on drop with smooth transition
      const snapSize = 20;
      const snappedX = Math.round(this.currentDrag.node.position.x / snapSize) * snapSize;
      const snappedY = Math.round(this.currentDrag.node.position.y / snapSize) * snapSize;

      this.currentDrag.node.position.x = snappedX;
      this.currentDrag.node.position.y = snappedY;

      // Clean up visual state with smooth transition
      if (nodeElement) {
        nodeElement.classList.remove('dragging', 'no-transition');

        // Smooth transition to final position
        nodeElement.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        nodeElement.style.transform = `translate3d(${snappedX}px, ${snappedY}px, 0)`;

        // Reset after transition
        setTimeout(() => {
          nodeElement.style.transform = '';
          nodeElement.style.transition = '';
          nodeElement.style.left = `${snappedX}px`;
          nodeElement.style.top = `${snappedY}px`;
        }, 200);
      }

      this.currentDrag.isDragging = false;
      this.dragSubject.next(this.currentDrag);
      this.currentDrag = null;
    }

    this.removeEventListeners();
    this.pendingUpdate = false;
  }

  private getEventCoordinates(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    return event instanceof MouseEvent
      ? { clientX: event.clientX, clientY: event.clientY }
      : { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
  }

  private addEventListeners(zoomLevel: number): void {
    this.onMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (this.currentDrag?.isDragging) {
        this.updateDragPosition(event.clientX, event.clientY, zoomLevel);
      }
    };

    this.onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (this.currentDrag?.isDragging) {
        const touch = event.touches[0];
        this.updateDragPosition(touch.clientX, touch.clientY, zoomLevel);
      }
    };

    document.addEventListener('mousemove', this.onMouseMove, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchend', this.onTouchEnd);

    // Prevent context menu during drag
    document.addEventListener('contextmenu', this.preventContextMenu);
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('contextmenu', this.preventContextMenu);
  }

  private onMouseMove = (event: MouseEvent): void => {};
  private onTouchMove = (event: TouchEvent): void => {};

  private onMouseUp = (): void => {
    this.endDrag();
  };

  private onTouchEnd = (): void => {
    this.endDrag();
  };

  private preventContextMenu = (event: Event): void => {
    if (this.currentDrag?.isDragging) {
      event.preventDefault();
    }
  };
}
