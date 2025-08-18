// template-info-section.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-template-info-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './template-info-section.component.html',
})
export class TemplateInfoSectionComponent {
  @Input() form!: FormGroup;
  @Input() categories: string[] = [];
  @Input() languages: [string, string][] = [];

  get templateNameControl(): FormControl {
    return this.form.get('templateName') as FormControl;
  }

  get categoryControl(): FormControl {
    return this.form.get('category') as FormControl;
  }

  get languageControl(): FormControl {
    return this.form.get('language') as FormControl;
  }
}
