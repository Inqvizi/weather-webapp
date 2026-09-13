import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherResponseDto } from '../../services/weather.service';
import { SettingsService } from '../../services/settings.service';
import { FavoritesService } from '../../services/favorites.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIcon, TranslatePipe],
  templateUrl: './current-weather.html',
  styleUrl: './current-weather.css',
})
export class CurrentWeather {

  @Input({ required: true }) weather!: WeatherResponseDto;

  settingsService = inject(SettingsService);
  favoritesService = inject(FavoritesService);
  translationService = inject(TranslationService);

  get weatherDescription(): string {
    return this.translationService.translateCondition(this.weather?.weatherCode, this.weather?.description);
  }

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
