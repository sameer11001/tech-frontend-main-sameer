import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-pagination.component.html',
  styleUrl: './chatbot-pagination.component.css'
})
export class ChatbotPaginationComponent {
  currentPage = 1;
  totalPages = 1;
  total = 5;
  perPage = 25;
  
  get currentStart(): number {
    return ((this.currentPage - 1) * this.perPage) + 1;
  }
  
  get currentEnd(): number {
    return Math.min(this.currentPage * this.perPage, this.total);
  }
} 