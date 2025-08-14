import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Answer {
  id: string;
  text: string;
}

@Component({
  selector: 'app-ask-question-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ask-question-modal.component.html',
  styleUrl: './ask-question-modal.component.css'
})
export class AskQuestionModalComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  selectedQuestionType = '';
  questionText = 'Ask a question here';
  headerText = '';
  bodyText = 'Ask a question here';
  footerText = '';

  answers: Answer[] = [
    { id: '1', text: 'Answer 1' },
    { id: '2', text: 'Default' }
  ];

  questionTypes = [
    { id: 'question', title: 'Question', description: 'Ask anything to the user', icon: '❓' },
    { id: 'buttons', title: 'Buttons', description: 'Choices based on buttons (Maximum of 3 choices)', icon: '🔘' },
    { id: 'list', title: 'List', description: 'Choices based on buttons (Maximum of 10 choices)', icon: '📝' }
  ];

  selectQuestionType(typeId: string) {
    this.selectedQuestionType = typeId;
  }

  addAnswer() {
    if (this.answers.length < 10) {
      this.answers.push({
        id: Date.now().toString(),
        text: 'New Answer'
      });
    }
  }

  removeAnswer(answerId: string) {
    this.answers = this.answers.filter(answer => answer.id !== answerId);
  }

  closeModal() {
    this.close.emit();
  }

  save() {
    // Handle save logic here
    this.closeModal();
  }
} 