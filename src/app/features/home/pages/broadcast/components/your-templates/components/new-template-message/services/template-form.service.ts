import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TemplateLanguageConstant } from '../../../../../../../../../core/utils/TemplateLanguageConstant';
import { TemplateConstants } from './template-constants.service';

export interface TemplateFormData {
  templateName: string;
  category: string;
  language: string;
  broadcastTitle: string;
  text: string;
  image: string;
  video: string;
  document: string;
  body: string;
  footer: string;
  websiteButtonText: string;
  websiteUrl: string;
  callButtonText: string;
  phoneNumber: string;
  offerCode: string;
  mediaId: string;
  quickReplyTexts: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TemplateFormService {
  private form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  createForm(): FormGroup {
    this.form = this.fb.group({
      templateName: [
        '',
        [Validators.required, Validators.pattern(TemplateConstants.TEMPLATE_NAME_PATTERN)],
      ],
      category: ['', Validators.required],
      language: ['', Validators.required],
      broadcastTitle: [TemplateConstants.BROADCAST_TYPES.NONE],
      text: [''],
      image: [''],
      video: [''],
      document: [''],
      body: ['', Validators.required],
      footer: [''],
      websiteButtonText: [''],
      websiteUrl: [''],
      callButtonText: [''],
      phoneNumber: [''],
      offerCode: [''],
      mediaId: [''],
      quickReplyTexts: this.fb.array([]),
    });

    return this.form;
  }

  getForm(): FormGroup {
    return this.form;
  }

  get quickReplyTexts(): FormArray {
    return this.form.get('quickReplyTexts') as FormArray;
  }

  resetForm(): void {
    this.form.reset();
    this.quickReplyTexts.clear();
  }

  patchForm(data: Partial<TemplateFormData>): void {
    this.form.patchValue(data);
  }

  clearMediaFields(): void {
    this.form.patchValue({
      image: '',
      video: '',
      document: '',
    });
  }

  getLanguages(): [string, string][] {
    const languages = Object.entries(TemplateLanguageConstant).map(([key, value]) => {
      const displayName = key
        .replace(/_/g, ' (') + (key.includes('_') ? ')' : '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      return [displayName, value] as [string, string];
    });
    
    return languages.sort((a, b) => a[0].localeCompare(b[0]));
  }

  getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  getFormValue(): TemplateFormData {
    return this.form.value;
  }
} 