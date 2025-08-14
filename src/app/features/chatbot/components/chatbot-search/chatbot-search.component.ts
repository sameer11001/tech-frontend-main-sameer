import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-search.component.html',
  styleUrl: './chatbot-search.component.css'
})
export class ChatbotSearchComponent {
  searchTerm = '';
} 