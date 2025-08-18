import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlowNodeType, DynamicFlowNodeBody } from '../../../../../core/models/chatbot.model';
import { Node } from '../../../../../core/models/chatbot.model';
@Injectable({
  providedIn: 'root'
})
export class NodeManagementService {
  private nodesSubject = new BehaviorSubject<Node[]>([]);
  private nodeIdCounter = 1;

  nodes$ = this.nodesSubject.asObservable();

  get nodes(): Node[] {
    return this.nodesSubject.value;
  }

  addNode(type: FlowNodeType, position: { x: number; y: number }): Node {
    const newNode: Node = {
      id: this.nodeIdCounter.toString(),
      type,
      title: this.getDefaultTitle(type),
      body: this.createEmptyBody(type),
      position,
      children: [],
      parent: null,
      isFirst: this.nodes.length === 0,
      isFinal: false,
    };

    this.nodeIdCounter++;
    const updatedNodes = [...this.nodes, newNode];
    this.nodesSubject.next(updatedNodes);

    return newNode;
  }

  deleteNode(nodeId: string): void {
    const updatedNodes = this.removeNodeFromArray(this.nodes, nodeId);
    this.nodesSubject.next(updatedNodes);
  }

  updateNode(nodeId: string, updates: Partial<Node>): void {
    const updatedNodes = this.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    this.nodesSubject.next(updatedNodes);
  }

  findNodeById(id: string): Node | null {
    return this.findInNodes(this.nodes, id);
  }

  private removeNodeFromArray(nodes: Node[], nodeId: string): Node[] {
    return nodes.filter(node => {
      if (node.id === nodeId) {
        return false;
      }
      node.children = this.removeNodeFromArray(node.children, nodeId);
      return true;
    });
  }

  private findInNodes(nodes: Node[], id: string): Node | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = this.findInNodes(node.children, id);
      if (found) return found;
    }
    return null;
  }

  private getDefaultTitle(type: FlowNodeType): string {
    const titles = {
      message: 'Send Message',
      question: 'Question',
      interactive_buttons: 'Interactive Buttons'
    };
    return titles[type];
  }

  private createEmptyBody(type: FlowNodeType): DynamicFlowNodeBody {
    const bodyCreators = {
      message: () => ({ bodyMessage: { content_items: [] } }),
      question: () => ({
        bodyQuestion: {
          question_text: '',
          answer_variant: '',
          accept_media_response: false,
          save_to_variable: false,
          variable_name: '',
        },
      }),
      interactive_buttons: () => ({
        bodyButton: {
          type: 'button' as const,
          body: { text: '' },
          action: { buttons: [] },
        },
      }),
    };

    return bodyCreators[type]?.() || {};
  }
}







