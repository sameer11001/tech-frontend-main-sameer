import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node } from '../../../../../../core/models/chatbot.model';

export interface NodeOption {
  title: string;
  type: string;
  icon: string;
  bgColor: string;
  iconBg: string;
}

@Component({
  selector: 'app-add-node-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-node-menu.component.html',
})
export class AddNodeMenuComponent {
  @Input() visible = false;
  @Input() selectedNode: Node | null = null;
  @Input() options: NodeOption[] = [];
  @Input() showCenterMenu = false;

  @Output() selectOption = new EventEmitter<NodeOption>();
  @Output() deleteNode = new EventEmitter<Node>();
  @Output() toggleMenu = new EventEmitter<void>();
}
