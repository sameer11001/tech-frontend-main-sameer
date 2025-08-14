import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../../core/services/toast-message.service';

@Component({
  selector: 'app-import-export-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-export-chats.component.html',
  styleUrls: ['./import-export-chats.component.css']
})
export class ImportExportChatsComponent implements OnInit {
  isDragOver = false;
  selectedFile: File | null = null;
  exportStatus = '';
  lastExportTime = '';

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Initialize component
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFileSelection(target.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    // Check if file is a zip file
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      this.selectedFile = file;
      console.log('Selected file:', file.name);
      this.toastService.showToast(`File "${file.name}" selected successfully`, 'success');
      // Here you would typically upload the file to your backend
    } else {
      this.toastService.showToast('Please select a valid ZIP file for chat backup.', 'error');
    }
  }

  startExport(): void {
    // Temporary implementation - just show toast message
    this.toastService.showToast('Export button clicked!', 'info');
  }

  startImport(): void {
    if (!this.selectedFile) {
      this.toastService.showToast('Please select a file to import first.', 'error');
      return;
    }
    
    // Simulate import process
    console.log('Starting import of:', this.selectedFile.name);
    this.toastService.showToast(`Import process started for "${this.selectedFile.name}". This may take a few minutes.`, 'info');
  }

  downloadExportedFile(): void {
    // Temporary implementation - just show toast message
    this.toastService.showToast('Download button clicked!', 'info');
  }
} 