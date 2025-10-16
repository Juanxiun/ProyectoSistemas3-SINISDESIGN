import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Notification } from '../notification/notification';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, Notification],
  templateUrl: './navbar.html',
  styles: ''
})
export class Navbar implements OnDestroy {
  @Input() Ubi: string = "";
  @Input() noResults: boolean = false; 
  @Output() onSearch = new EventEmitter<string>();

  searchText: string = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.onSearch.emit(searchTerm);
    });
  }

  handleInputChange() {
    this.searchSubject.next(this.searchText);
  }

  clearSearch() {
    this.searchText = '';
    this.onSearch.emit('');
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
