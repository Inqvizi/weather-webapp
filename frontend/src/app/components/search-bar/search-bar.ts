import { Component, EventEmitter, Output, signal, inject, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { WeatherService, CitySearchResultDto } from '../../services/weather.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const HISTORY_STORAGE_KEY = 'weather_search_history';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnInit {
  @Output() search = new EventEmitter<string>();
  @Output() coordinatesSelected = new EventEmitter<{ latitude: number; longitude: number; cityName?: string }>();

  private weatherService = inject(WeatherService);
  translationService = inject(TranslationService);
  private elementRef = inject(ElementRef);
  private searchSubject = new Subject<string>();

  suggestions = signal<CitySearchResultDto[]>([]);
  searchHistory = signal<string[]>([]);
  isLoading = signal<boolean>(false);
  isLocating = signal<boolean>(false);
  isFocused = signal<boolean>(false);
  inputValue = signal<string>('');

  ngOnInit(): void {
    this.loadHistory();
  }

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
        const lang = this.translationService.currentLanguage();
        return this.weatherService.searchCities(query, lang).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe((results) => {
      this.suggestions.set(results);
      this.isLoading.set(false);
    });
  }

  loadHistory(): void {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.searchHistory.set(parsed.slice(0, 5));
        }
      }
    } catch {
      this.searchHistory.set([]);
    }
  }

  addToHistory(city: string): void {
    const trimmed = city.trim();
    if (!trimmed) return;

    const current = this.searchHistory().filter(c => c.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, 5);
    this.searchHistory.set(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  removeHistoryItem(city: string, event: Event): void {
    event.stopPropagation();
    const updated = this.searchHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
    this.searchHistory.set(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  clearHistory(): void {
    this.searchHistory.set([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.searchSubject.next(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const city = this.inputValue().trim();
      if (city) {
        this.selectCity(city);
      }
    } else if (event.key === 'Escape') {
      this.clearSuggestions();
      this.isFocused.set(false);
    }
  }

  selectCity(city: string): void {
    this.addToHistory(city);
    this.search.emit(city);
    this.inputValue.set('');
    this.clearSuggestions();
    this.isFocused.set(false);
  }

  locateMe(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.isLocating.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.weatherService.reverseGeocode(lat, lon).pipe(
          catchError(() => of(null))
        ).subscribe({
          next: (geoData) => {
            const cityName = geoData?.city || geoData?.locality || geoData?.principalSubdivision || 'My Location';
            this.addToHistory(cityName);
            this.coordinatesSelected.emit({ latitude: lat, longitude: lon, cityName });
            this.isLocating.set(false);
            this.inputValue.set('');
            this.clearSuggestions();
            this.isFocused.set(false);
          },
          error: () => {
            this.coordinatesSelected.emit({ latitude: lat, longitude: lon, cityName: 'My Location' });
            this.isLocating.set(false);
            this.isFocused.set(false);
          }
        });
      },
      (error) => {
        this.isLocating.set(false);
        console.warn('Geolocation error:', error);
        alert('Could not detect your location. Please check browser permissions or search by city name.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  clearSuggestions(): void {
    this.suggestions.set([]);
    this.isLoading.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clearSuggestions();
      this.isFocused.set(false);
    }
  }
}
