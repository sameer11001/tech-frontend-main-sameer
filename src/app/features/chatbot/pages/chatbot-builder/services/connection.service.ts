// services/connection.service.ts
import { Injectable } from '@angular/core';
import { Node } from '../../../../../core/models/chatbot.model';

export interface Connection {
  from: Node;
  to: Node;
  buttonIndex?: number;
  buttonId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  createConnection(
    sourceNode: Node,
    targetNode: Node,
    buttonIndex?: number,
    buttonId?: string
  ): boolean {
    if (this.canConnect(sourceNode, targetNode)) {
      // For interactive button nodes, handle button-specific connections
      if (
        sourceNode.type === 'interactive_buttons' &&
        buttonIndex !== undefined
      ) {
        this.createButtonConnection(
          sourceNode,
          targetNode,
          buttonIndex,
          buttonId
        );
      } else {
        // Regular node connection
        sourceNode.children.push(targetNode);
      }

      // Update parent relationships
      if (!targetNode.parents) {
        targetNode.parents = [];
      }
      if (!targetNode.parents.some((parent) => parent.id === sourceNode.id)) {
        targetNode.parents.push(sourceNode);
      }

      if (!sourceNode.nextNodes) {
        sourceNode.nextNodes = targetNode.id;
      }

      return true;
    }
    return false;
  }

  private createButtonConnection(
    sourceNode: Node,
    targetNode: Node,
    buttonIndex: number,
    buttonId?: string
  ): void {
    // Ensure the button connections array exists
    if (!sourceNode.buttonConnections) {
      sourceNode.buttonConnections = {};
    }

    // Store the connection for this specific button
    sourceNode.buttonConnections[buttonIndex] = targetNode.id;

    // Also add to children for compatibility
    if (!sourceNode.children.some((child) => child.id === targetNode.id)) {
      sourceNode.children.push(targetNode);
    }
  }

  getAllConnections(nodes: Node[]): Connection[] {
    const connections: Connection[] = [];

    const collectConnections = (nodeList: Node[]): void => {
      for (const node of nodeList) {
        if (node.type === 'interactive_buttons' && node.buttonConnections) {
          // Handle button-specific connections
          Object.entries(node.buttonConnections).forEach(
            ([buttonIndex, targetNodeId]) => {
              const targetNode = this.findNodeById(
                nodes,
                targetNodeId as string
              );
              if (targetNode) {
                const buttonId =
                  node.body.bodyButton?.action?.buttons?.[parseInt(buttonIndex)]
                    ?.reply?.id;
                connections.push({
                  from: node,
                  to: targetNode,
                  buttonIndex: parseInt(buttonIndex),
                  buttonId,
                });
              }
            }
          );
        } else {
          // Handle regular connections
          for (const child of node.children) {
            connections.push({ from: node, to: child });
          }
        }
        collectConnections(node.children);
      }
    };

    collectConnections(nodes);
    return connections;
  }

  getConnectionPoint(
    node: Node,
    buttonIndex?: number
  ): { x: number; y: number } {
    if (node.type === 'interactive_buttons' && buttonIndex !== undefined) {
      return this.calculateButtonPosition(node, buttonIndex);
    }

    const cardWidth = node.type === 'interactive_buttons' ? 384 : 320;
    const cardHeight = 120;

    return {
      x: node.position.x + cardWidth,
      y: node.position.y + cardHeight / 2,
    };
  }
  private canConnect(sourceNode: Node, targetNode: Node): boolean {
    if (sourceNode.id === targetNode.id) {
      return false;
    }

    if (sourceNode.children.some((child) => child.id === targetNode.id)) {
      return false;
    }

    return true;
  }

  private calculateButtonPosition(
    node: Node,
    buttonIndex: number
  ): { x: number; y: number } {
    const nodeWidth = 384; // Interactive buttons node width
    const nodeHeaderHeight = 120; // Approximate header height
    const formSectionHeight = 200; // Height of form sections above buttons
    const buttonContainerPadding = 12;
    const buttonHeight = 60; // Including padding and spacing

    const buttonY =
      nodeHeaderHeight +
      formSectionHeight +
      buttonIndex * buttonHeight +
      buttonContainerPadding;

    return {
      x: node.position.x + nodeWidth - 12, // 12px offset for the connection button
      y: node.position.y + buttonY + buttonHeight / 3, // Center vertically on button
    };
  }

  private findNodeById(nodes: Node[], id: string): Node | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = this.findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  }

  deleteConnection(
    sourceNode: Node,
    targetNode: Node,
    buttonIndex?: number
  ): void {
    if (
      sourceNode.type === 'interactive_buttons' &&
      buttonIndex !== undefined
    ) {
      // Remove button-specific connection
      if (sourceNode.buttonConnections) {
        delete sourceNode.buttonConnections[buttonIndex];
      }

      // Check if this was the last connection to this target from this node
      const hasOtherConnections = Object.values(
        sourceNode.buttonConnections || {}
      ).some((targetId) => targetId === targetNode.id);

      if (!hasOtherConnections) {
        // Remove from children if no other buttons connect to this target
        const childIndex = sourceNode.children.findIndex(
          (child) => child.id === targetNode.id
        );
        if (childIndex > -1) {
          sourceNode.children.splice(childIndex, 1);
        }
      }
    } else {
      // Regular connection deletion
      const childIndex = sourceNode.children.findIndex(
        (child) => child.id === targetNode.id
      );
      if (childIndex > -1) {
        sourceNode.children.splice(childIndex, 1);
      }
    }

    // Update parent relationships
    if (targetNode.parents) {
      const shouldRemoveParent =
        sourceNode.type === 'interactive_buttons'
          ? !Object.values(sourceNode.buttonConnections || {}).some(
              (targetId) => targetId === targetNode.id
            )
          : true;

      if (shouldRemoveParent) {
        const parentIndex = targetNode.parents.findIndex(
          (parent) => parent.id === sourceNode.id
        );
        if (parentIndex > -1) {
          targetNode.parents.splice(parentIndex, 1);
        }
      }
    }

    // Update nextNodes
    if (sourceNode.nextNodes === targetNode.id) {
      sourceNode.nextNodes =
        sourceNode.children.length > 0 ? sourceNode.children[0].id : null;
    }
  }
}
