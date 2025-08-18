import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { ConnectionButtonComponent } from './../../shared/connection-button.component';
import { NodeHeaderComponent } from './../../shared/node-header/node-header.component';
import { QuestionPreviewComponent } from '../question-preview/question-preview.component';
import { BaseNodeComponent } from '../base/base-node.component';
import { DragDropService } from './../../services/drag-drop.service';

@Component({
  selector: 'app-question-node',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConnectionButtonComponent,
    NodeHeaderComponent,
    QuestionPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-question-node.component.html',
})
export class QuestionNodeComponent extends BaseNodeComponent implements OnInit {
  questionForm = this.fb.group({
    questionText: [''],
    answerVariant: [''],
    saveToVariable: [false],
    variableName: [''],
    acceptMediaResponse: [false]
  });

  answerTypeOptions = [
    { value: '', label: 'Select answer type' },
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'choice', label: 'Multiple Choice' }
  ];

  constructor(
    dragDropService: DragDropService,
    private fb: FormBuilder,
    cdr: ChangeDetectorRef
  ) {
    super(dragDropService, cdr);
  }
  protected initializeNode(): void {
    if (!this.node.body.bodyQuestion) {
      this.node.body.bodyQuestion = {
        question_text: '',
        answer_variant: '',
        accept_media_response: false,
        save_to_variable: false,
        variable_name: ''
      };
    }

    this.initializeForm();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    const question = this.node.body.bodyQuestion!;
    this.questionForm.patchValue({
      questionText: question.question_text,
      answerVariant: question.answer_variant,
      saveToVariable: question.save_to_variable,
      variableName: question.variable_name,
      acceptMediaResponse: question.accept_media_response
    });
  }

  private setupFormSubscriptions(): void {
    this.questionForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        if (this.node.body.bodyQuestion) {
          Object.assign(this.node.body.bodyQuestion, {
            question_text: values.questionText,
            answer_variant: values.answerVariant,
            save_to_variable: values.saveToVariable,
            variable_name: values.variableName,
            accept_media_response: values.acceptMediaResponse
          });
          this.emitContentChange();
        }
      });
  }
}
