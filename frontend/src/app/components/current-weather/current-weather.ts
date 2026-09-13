import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherResponseDto } from '../../services/weather.service';
import { SettingsService } from '../../services/settings.service';
import { FavoritesService } from '../../services/favorites.service';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIcon],
  templateUrl: './current-weather.html',
  styleUrl: './current-weather.css',
})
export class CurrentWeather {

  @Input({ required: true }) weather!: WeatherResponseDto;

  settingsService = inject(SettingsService);
  favoritesService = inject(FavoritesService);

  get isFavorite(): boolean {

    return this.favoritesService.isFavorite(this.weather?.cityName);
  }

  toggleFavorite(): void {
    if (this.weather?.cityName) {
      this.favoritesService.toggleFavorite(this.weather.cityName);
    }
  }

  formatTemp(temp: number): string {
    return this.settingsService.formatTemp(temp);
  }
}
