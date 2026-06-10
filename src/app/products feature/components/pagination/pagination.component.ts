import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() pageNumber: number = 1;
  @Input() totalPages: number = 1;
  @Input() hasNext: boolean = false;
  @Input() hasPrevious: boolean = false;

  @Output() pageChange = new EventEmitter<number>();

  onPrev(): void {
    if (this.hasPrevious) {
      this.pageChange.emit(this.pageNumber - 1);
    }
  }

  onNext(): void {
    if (this.hasNext) {
      this.pageChange.emit(this.pageNumber + 1);
    }
  }

  onPageSelect(page: number): void {
    if (page !== this.pageNumber) {
      this.pageChange.emit(page);
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.pageNumber - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
