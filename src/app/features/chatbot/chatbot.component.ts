import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotHeaderComponent } from './components/chatbot-header/chatbot-header.component';
import { ChatbotTabsComponent } from './components/chatbot-tabs/chatbot-tabs.component';
import { ChatbotSearchComponent } from './components/chatbot-search/chatbot-search.component';
import { ChatbotTableComponent } from './components/chatbot-table/chatbot-table.component';
import { ChatbotPaginationComponent } from './components/chatbot-pagination/chatbot-pagination.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    ChatbotHeaderComponent,
    ChatbotTabsComponent,
    ChatbotSearchComponent,
    ChatbotTableComponent,
    ChatbotPaginationComponent
],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {

}
