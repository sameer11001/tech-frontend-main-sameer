import { Injectable } from '@angular/core';
import { ChatbotApiService } from '../chatbot.service';

@Injectable()
export class ChatbotEffects {
  constructor(
    private chatbot: ChatbotApiService,
  ) {}

}
