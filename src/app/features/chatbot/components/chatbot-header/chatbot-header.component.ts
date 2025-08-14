import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-header.component.html',
  styleUrl: './chatbot-header.component.css'
})
export class ChatbotHeaderComponent {
  constructor(private router: Router) {}

  addChatbot() {
    this.router.navigate(['/chatbot/builder']);
  }
} 