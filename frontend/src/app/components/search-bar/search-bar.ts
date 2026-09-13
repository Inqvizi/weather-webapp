import { Component, EventEmitter, Output, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { WeatherService, CitySearchResultDto } from '../../services/weather.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  @Output() search = new EventEmitter<string>();

  private weatherService = inject(WeatherService);
  private elementRef = inject(ElementRef);
  private searchSubject = new Subject<string>();

  suggestions = signal<CitySearchResultDto[]>([]);
  isLoading = signal<boolean>(false);
  inputValue = signal<string>('');

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query || query.trim().length < 2) {
          this.isLoading.set(false);
          return of([]);
        }
        this.isLoading.set(true);
        return this.weatherService.searchCities(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe((results) => {
      this.suggestions.set(results);
      this.isLoading.set(false);
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.searchSubject.next(value);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const city = this.inputValue().trim();
      if (city) {
        this.selectCity(city);
      }
    } else if (event.key === 'Escape') {
      this.clearSuggestions();
    }
  }

  selectCity(city: string) {
    this.search.emit(city);
    this.inputValue.set('');
    this.clearSuggestions();
  }

  clearSuggestions() {
    this.suggestions.set([]);
    this.isLoading.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clearSuggestions();
    }
  }
}
