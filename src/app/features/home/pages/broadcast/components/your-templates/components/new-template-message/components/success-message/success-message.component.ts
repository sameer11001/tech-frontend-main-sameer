// success-message.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all duration-500 scale-100">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ title }}</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-center">
          <div class="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  `
})
export class SuccessMessageComponent {
  @Input() isVisible = false;
  @Input() title = 'Template Created Successfully!';
  @Input() message = 'Your WhatsApp template has been created and is ready to use.';
}
