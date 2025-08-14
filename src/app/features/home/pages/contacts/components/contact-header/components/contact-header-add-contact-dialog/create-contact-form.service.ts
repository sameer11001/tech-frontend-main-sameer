import { Injectable } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import parsePhoneNumberFromString from "libphonenumber-js";

@Injectable({ providedIn: 'root' })
export class CreateContactFormService {
    constructor(private fb: FormBuilder) { }

    createContactForm(): FormGroup {
        const form = this.fb.group({
            name: ['', Validators.required],
            countryCode: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            customAttributes: this.fb.array([])
        });

        this.initializePhoneValidation(form);
        return form;
    }

    private initializePhoneValidation(form: FormGroup): void {
        const phoneControl = form.get('phoneNumber');
        form.get('countryCode')?.valueChanges.subscribe(countryCode => {
            phoneControl?.setValidators([Validators.required, this.createPhoneValidator(countryCode ?? '')]);
            phoneControl?.updateValueAndValidity();
        });
    }

    createCustomAttributeForm(): FormGroup {
        return this.fb.group({
            attributeId: [null],
            attributeName: [null, Validators.required],
            value: ['', Validators.required]
        }, { validators: [this.attributeValidator()] });
    }

    private attributeValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const attributeName = group.get('attributeName')?.value;
            const value = group.get('value')?.value;
            return attributeName && !value ? { valueRequired: true } : null;
        };
    }

    addCustomAttribute(form: FormGroup): void {
        const attributes = form.get('customAttributes') as FormArray;
        attributes.push(this.createCustomAttributeForm());
    }

    removeCustomAttribute(form: FormGroup, index: number): void {
        const attributes = form.get('customAttributes') as FormArray;
        attributes.removeAt(index);
    }

    private createPhoneValidator(countryCode: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || !countryCode) return null;
            try {
                const phoneNumber = parsePhoneNumberFromString(control.value, countryCode as any);
                return phoneNumber?.isValid() ? null : { invalidPhone: true };
            } catch (e) {
                return { invalidPhone: true };
            }
        };
    }

    getPhoneNumber(formValue: any): string {
        const phoneNumber = parsePhoneNumberFromString(formValue.phoneNumber, formValue.countryCode);
        return phoneNumber?.formatInternational() || '';
    }
}