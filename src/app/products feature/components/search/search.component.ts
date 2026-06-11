import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Output() search = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {
    this.subscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(val => {
      this.search.emit(val);
    });
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  clearSearch(): void {
    this.value = '';
    this.searchSubject.next('');
    this.search.emit('');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
