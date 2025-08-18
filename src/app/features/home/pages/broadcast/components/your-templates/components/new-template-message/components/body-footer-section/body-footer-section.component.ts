// body-footer-section.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-body-footer-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './body-footer-section.component.html',
})
export class BodyFooterSectionComponent {
  @Input() form!: FormGroup;

  @Output() addVariable = new EventEmitter<void>();

  onAddVariable(): void {
    this.addVariable.emit();
  }
}
