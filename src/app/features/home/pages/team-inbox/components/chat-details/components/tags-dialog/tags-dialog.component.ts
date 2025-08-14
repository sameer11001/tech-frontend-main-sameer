import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ContactTag } from '../../../../../../../../core/models/contact-tags.model';
import { AddTagDialogComponent } from '../add-tag-dialog/add-tag-dialog.component';

@Component({
  selector: 'app-tags-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './tags-dialog.component.html',
  styleUrls: ['./tags-dialog.component.css']
})
export class TagsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TagsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tags: ContactTag[], contactName: string, contactId: string },
    private dialog: MatDialog
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onAddNewTag(): void {
    const addTagDialogRef = this.dialog.open(AddTagDialogComponent, {
      width: '400px',
      data: {
        contactId: this.data.contactId,
        contactName: this.data.contactName
      }
    });

    addTagDialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        // Close with refresh and dataChanged flags to indicate new data was added
        this.dialogRef.close({ refresh: true, dataChanged: true });
      }
    });
  }
} 