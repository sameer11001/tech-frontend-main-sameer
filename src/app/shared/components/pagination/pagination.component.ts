// pagination.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PaginationComponent {
  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() totalCount!: number;
  @Input() limit!: number;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  get rangeText(): string {
    const start = (this.currentPage - 1) * this.limit + 1;
    const end = Math.min(this.currentPage * this.limit, this.totalCount);
    return `${start}–${end} of ${this.totalCount.toLocaleString()}`;
  }

  onLimitChanged(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const newLimit = parseInt(selectElement.value, 10);
      this.limit = newLimit;
      this.limitChange.emit(newLimit);
      this.pageChange.emit(1);
    }
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }
}