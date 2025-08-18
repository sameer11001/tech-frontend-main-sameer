import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormsModule,
} from '@angular/forms';

import { takeUntil } from 'rxjs';
import { DragDropService } from './../../services/drag-drop.service';
import { NodeHeaderComponent } from './../../shared/node-header/node-header.component';
import { BaseNodeComponent } from '../base/base-node.component';

@Component({
  selector: 'app-interactive-buttons-node',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Added for ngModel
    NodeHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-interactive-buttons-node.component.html',
})
export class InteractiveButtonsNodeComponent
  extends BaseNodeComponent
  implements OnInit
{
  // Override the regular connection start to prevent it for button nodes
  override onConnectionStart = new EventEmitter<MouseEvent | TouchEvent>();
  onButtonConnectionStart_Event = new EventEmitter<{
    event: MouseEvent | TouchEvent;
    buttonIndex: number;
    buttonId: string;
  }>();

  buttonsForm = this.fb.group({
    type: ['button'], // Fixed: providing default value
    bodyText: [''],
    buttons: this.fb.array([]),
  });

  headerFormGroup = this.fb.group({
    type: ['text'],
    text: [''],
  });

  footerFormGroup = this.fb.group({
    text: [''],
  });

  headerEnabled = false;
  footerEnabled = false;

  typeOptions = [{ value: 'button', label: 'Button' }];

  constructor(
    dragDropService: DragDropService,
    private fb: FormBuilder,
    cdr: ChangeDetectorRef
  ) {
    super(dragDropService,cdr);
  }

  get buttonsFormArray(): FormArray {
    return this.buttonsForm.get('buttons') as FormArray;
  }

  protected initializeNode(): void {
    if (!this.node.body.bodyButton) {
      this.node.body.bodyButton = {
        type: 'button',
        body: { text: '' },
        action: { buttons: [] },
      };
    }

    this.initializeForm();
    this.setupFormSubscriptions();
  }

  onButtonConnectionStart(
    event: MouseEvent | TouchEvent,
    buttonIndex: number
  ): void {
    event.stopPropagation();
    event.preventDefault();

    // Create a custom event with button information
    const customEvent = {
      ...event,
      buttonIndex,
      buttonId: this.buttonsFormArray.at(buttonIndex)?.get('id')?.value,
    };

    this.onConnectionStart.emit(customEvent as any);
  }

  toggleHeader(enabled: boolean): void {
    this.headerEnabled = enabled;
    if (enabled && this.node.body.bodyButton) {
      this.node.body.bodyButton.header = {
        type: 'text',
        text: '',
      };
    } else if (this.node.body.bodyButton) {
      delete this.node.body.bodyButton.header;
    }
    this.emitContentChange();
  }

  toggleFooter(enabled: boolean): void {
    this.footerEnabled = enabled;
    if (enabled && this.node.body.bodyButton) {
      this.node.body.bodyButton.footer = { text: '' };
    } else if (this.node.body.bodyButton) {
      delete this.node.body.bodyButton.footer;
    }
    this.emitContentChange();
  }

  addButton(): void {
    if (this.buttonsFormArray.length >= 3) return;

    const buttonGroup = this.fb.group({
      id: [`button_${this.buttonsFormArray.length + 1}_${Date.now()}`],
      title: [`Button ${this.buttonsFormArray.length + 1}`],
    });

    this.buttonsFormArray.push(buttonGroup);
    this.updateNodeButtons();
  }

  removeButton(index: number): void {
    this.buttonsFormArray.removeAt(index);
    this.updateNodeButtons();
  }

  getButtonsCount(): number {
    return this.buttonsFormArray.length;
  }

  handleHeaderMedia(event: any): void {
    const file = event.target.files[0];
    if (file && this.node.body.bodyButton?.header) {
      this.node.body.bodyButton.header.media = {
        filename: file.name,
        type: file.type,
        size: file.size,
      };
      this.emitContentChange();
    }
  }

  private initializeForm(): void {
    const button = this.node.body.bodyButton!;

    this.buttonsForm.patchValue({
      type: button.type || 'button', // Fixed: ensure type is never undefined
      bodyText: button.body?.text || '',
    });

    // Initialize header
    if (button.header) {
      this.headerEnabled = true;
      this.headerFormGroup.patchValue({
        type: button.header.type || 'text',
        text: button.header.text || '',
      });
    }

    // Initialize footer
    if (button.footer) {
      this.footerEnabled = true;
      this.footerFormGroup.patchValue({
        text: button.footer.text || '',
      });
    }

    // Initialize buttons
    this.buttonsFormArray.clear();
    button.action?.buttons?.forEach((btn) => {
      const buttonGroup = this.fb.group({
        id: [btn.reply?.id || ''],
        title: [btn.reply?.title || ''],
      });
      this.buttonsFormArray.push(buttonGroup);
    });
  }

  private setupFormSubscriptions(): void {
    this.buttonsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateNodeFromForm();
      });

    this.headerFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.headerEnabled) {
          this.updateNodeFromForm();
        }
      });

    this.footerFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.footerEnabled) {
          this.updateNodeFromForm();
        }
      });
  }

  private updateNodeFromForm(): void {
    if (!this.node.body.bodyButton) return;

    const formValue = this.buttonsForm.value;

    // Fixed: ensure type is always 'button'
    this.node.body.bodyButton.type = (formValue.type as 'button') || 'button';
    this.node.body.bodyButton.body.text = formValue.bodyText || '';

    if (this.headerEnabled) {
      this.node.body.bodyButton.header = {
        type: (this.headerFormGroup.value.type as 'text' | 'media') || 'text',
        text: this.headerFormGroup.value.text || '',
      };
    }

    if (this.footerEnabled) {
      this.node.body.bodyButton.footer = {
        text: this.footerFormGroup.value.text || '',
      };
    }

    this.updateNodeButtons();
    this.emitContentChange();
  }

  private updateNodeButtons(): void {
    if (!this.node.body.bodyButton) return;

    this.node.body.bodyButton.action.buttons = this.buttonsFormArray.value.map(
      (btn: any) => ({
        type: 'reply' as const,
        reply: {
          id: btn.id || '',
          title: btn.title || '',
        },
      })
    );
  }
}
