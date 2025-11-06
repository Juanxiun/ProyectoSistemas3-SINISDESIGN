import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Notification } from '../notification/notification';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, Notification],
  templateUrl: './navbar.html',
  styles: ''
})
export class Navbar implements OnDestroy {
  @Input() id: string = "";
  @Input() Ubi: string = "";
  @Input() noResults: boolean = false;
  @Output() onSearch = new EventEmitter<string>();


  searchText: string = '';
  private searchSubject = new Subject<string>();

  get hasValidSearchText(): boolean {
    if (!this.searchText) return false;
    const normalized = this.searchText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '')
      .trim();
    return normalized.length > 0;
  }

  constructor(private router: Router,) {
    this.searchSubject.pipe(
      debounceTime(300),
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
  goMiPerfil() {
    this.router.navigate(['/miPerfil']);
  }
  ngOnDestroy() {
    this.searchSubject.complete();
  }
}