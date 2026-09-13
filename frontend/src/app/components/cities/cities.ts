import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherResponseDto, CitySearchResultDto } from '../../services/weather.service';
import { FavoritesService } from '../../services/favorites.service';
import { SettingsService } from '../../services/settings.service';
import { WeatherIcon } from '../weather-icon/weather-icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CityCardData {
  name: string;
  weather?: WeatherResponseDto;
  isLoading: boolean;
  error?: string;
}

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, WeatherIcon],
  templateUrl: './cities.html',
  styleUrl: './cities.css',
})
export class CitiesComponent implements OnInit {

  @Output() selectCity = new EventEmitter<string>();

  weatherService = inject(WeatherService);
  favoritesService = inject(FavoritesService);
  settingsService = inject(SettingsService);

  cityCards = signal<CityCardData[]>([]);
  newCityInput = signal<string>('');
  searchResults = signal<CitySearchResultDto[]>([]);
  isSearching = signal<boolean>(false);

  popularCities: string[] = ['London', 'Kyiv', 'New York', 'Tokyo', 'Paris', 'Lviv'];

  ngOnInit(): void {
    this.loadFavoritesWeather();
  }

  loadFavoritesWeather(): void {
    const list = this.favoritesService.favorites();
    const initialCards: CityCardData[] = list.map(name => ({
      name,
      isLoading: true
    }));
    this.cityCards.set(initialCards);

    list.forEach((city, index) => {
      this.weatherService.getCurrentWeather(city).pipe(
        catchError(() => of(null))
      ).subscribe(weather => {
        const current = [...this.cityCards()];
        if (current[index]) {
          if (weather) {
            current[index] = { name: city, weather, isLoading: false };
          } else {
            current[index] = { name: city, isLoading: false, error: 'Could not load' };
          }
          this.cityCards.set(current);
        }
      });
    });
  }

  onSearchInput(query: string): void {
    this.newCityInput.set(query);
    if (!query || query.trim().length < 2) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);
    this.weatherService.searchCities(query).pipe(
      catchError(() => of([]))
    ).subscribe(results => {
      this.searchResults.set(results);
      this.isSearching.set(false);
    });
  }

  addCityFromSearch(city: CitySearchResultDto): void {
    this.favoritesService.addFavorite(city.name);
    this.newCityInput.set('');
    this.searchResults.set([]);
    this.loadFavoritesWeather();
  }

  addPopular(cityName: string): void {
    this.favoritesService.addFavorite(cityName);
    this.loadFavoritesWeather();
  }

  removeFavorite(cityName: string, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavorite(cityName);
    this.loadFavoritesWeather();
  }

  openCity(cityName: string): void {
    this.selectCity.emit(cityName);
  }

  formatTemp(temp?: number): string {
    if (temp === undefined || temp === null) return '--';
    return this.settingsService.formatTemp(temp);
  }

  formatWind(wind?: number): string {
    if (wind === undefined || wind === null) return '--';
    return this.settingsService.formatWind(wind);
  }
}

