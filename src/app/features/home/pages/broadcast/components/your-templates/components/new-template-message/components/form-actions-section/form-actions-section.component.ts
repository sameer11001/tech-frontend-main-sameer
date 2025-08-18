// form-actions-section.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-actions-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-actions-section.component.html',
})
export class FormActionsSectionComponent {
  @Input() form!: FormGroup;
  @Input() isLoading = false;
  @Input() isAuthenticationCategory = false;
  @Input() submitButtonText = 'Create Template';
  @Input() cancelButtonText = 'Cancel';
  @Input() loadingText = 'Creating...';

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get isSubmitDisabled(): boolean {
    return this.form.invalid || this.isAuthenticationCategory || this.isLoading;
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
