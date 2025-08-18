// buttons-section.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { ButtonConfigFieldsComponent } from "../button-config-fields/button-config-fields.component";

@Component({
  selector: 'app-buttons-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonConfigFieldsComponent],
  templateUrl: './buttons-section.component.html',
})
export class ButtonsSectionComponent {
  @Input() shouldShowButtonSection = true;
  @Input() showButton = false;
  @Input() buttonTypes: string[] = [];
  @Input() visitWebsiteButton = false;
  @Input() callPhoneButton = false;
  @Input() copyOfferButton = false;
  @Input() quickReplyButton = 0;
  @Input() marketingButtonRequired = false;
  @Input() isAuthenticationCategory = false;
  @Input() form!: FormGroup;

  @Output() toggle = new EventEmitter<Event>();
  @Output() addButton = new EventEmitter<string>();
  @Output() deleteQuickReplyButton = new EventEmitter<number>();

  onToggle(event: Event): void {
    this.toggle.emit(event);
  }

  onAddButton(buttonType: string): void {
    this.addButton.emit(buttonType);
  }

  onDeleteQuickReplyButton(index: number): void {
    this.deleteQuickReplyButton.emit(index);
  }

  isButtonActive(buttonType: string): boolean {
    switch (buttonType.toLowerCase()) {
      case 'visit website':
        return this.visitWebsiteButton;
      case 'call phone':
        return this.callPhoneButton;
      case 'copy offer code':
        return this.copyOfferButton;
      default:
        return false;
    }
  }
}
