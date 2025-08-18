import { Component, Input, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: 'text' | 'textarea' | 'select' = 'text';
  @Input() placeholder?: string;
  @Input() maxLength?: number;
  @Input() rows?: number;
  @Input() required = false;
  @Input() showCharacterCount = true;
  @Input() options: SelectOption[] = [];
  @Input() control?: AbstractControl | null;

  value: any = '';
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  getInputClasses(): string {
    const baseClasses = 'w-full p-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent transition-colors';
    const errorClasses = this.control?.errors && this.control?.touched
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500';
    return `${baseClasses} ${errorClasses}`;
  }

  getTextareaClasses(): string {
    const baseClasses = 'w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:border-transparent transition-colors';
    const errorClasses = this.control?.errors && this.control?.touched
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500';
    return `${baseClasses} ${errorClasses}`;
  }

  getSelectClasses(): string {
    const baseClasses = 'w-full p-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent transition-colors';
    const errorClasses = this.control?.errors && this.control?.touched
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500';
    return `${baseClasses} ${errorClasses}`;
  }

  getErrorMessage(): string {
    if (!this.control?.errors) return '';

    const errors = this.control.errors;
    if (errors['required']) return `${this.label} is required`;
    if (errors['maxlength']) return `${this.label} is too long`;
    if (errors['requiredText']) return `${this.label} cannot be empty`;
    if (errors['invalidVariableName']) return 'Invalid variable name format';

    return 'Invalid input';
  }
}

