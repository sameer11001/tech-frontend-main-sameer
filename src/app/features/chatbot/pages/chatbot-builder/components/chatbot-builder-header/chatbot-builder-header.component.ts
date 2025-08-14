import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot-builder-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-builder-header.component.html',
  styleUrl: './chatbot-builder-header.component.css'
})
export class ChatbotBuilderHeaderComponent {
  @Output() backClick = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() testChatbot = new EventEmitter<void>();

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/chatbot']);
  }

  onSave() {
    this.save.emit();
  }

  onTestChatbot() {
    this.testChatbot.emit();
  }
} 