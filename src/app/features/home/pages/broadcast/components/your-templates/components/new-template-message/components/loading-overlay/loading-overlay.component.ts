// loading-overlay.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div class="text-center">
        <img src="/assets/features/loader_logo.gif" alt="Loading..." class="w-32 h-32 mx-auto mb-6" />
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">{{ title }}</h2>
        <p class="text-gray-600">{{ message }}</p>
      </div>
    </div>
  `
})
export class LoadingOverlayComponent {
  @Input() isVisible = false;
  @Input() title = 'Creating Template...';
  @Input() message = 'Please wait while we process your template';
}
