import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-node-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './node-header.component.html',
})
export class NodeHeaderComponent {
  @Input() title!: string;
  @Input() icon!: string;
  @Input() color!: 'blue' | 'green' | 'yellow';

  @Output() addNode = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  getIconClasses(): string {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center';
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    return `${baseClasses} ${colorClasses[this.color]}`;
  }
}
