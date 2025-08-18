// button-config-fields.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-button-config-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './button-config-fields.component.html',
})
export class ButtonConfigFieldsComponent {
  @Input() form!: FormGroup;
  @Input() visitWebsiteButton = false;
  @Input() callPhoneButton = false;
  @Input() copyOfferButton = false;
  @Input() quickReplyButton = 0;
  @Input() isAuthenticationCategory = false;

  @Output() deleteQuickReply = new EventEmitter<number>();

  onDeleteQuickReply(index: number): void {
    this.deleteQuickReply.emit(index);
  }

  getQuickReplyControls(): any[] {
    const quickReplyTexts = this.form.get('quickReplyTexts') as FormArray;
    return quickReplyTexts ? quickReplyTexts.controls : [];
  }
}
