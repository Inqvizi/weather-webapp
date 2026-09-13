import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherResponseDto } from '../../services/weather.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-air-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './air-conditions.html',
  styleUrl: './air-conditions.css',
})
export class AirConditions {
  @Input({ required: true }) weather!: WeatherResponseDto;

  settingsService = inject(SettingsService);

  formatFeelsLike(): string {
    return this.settingsService.formatTemp(this.weather.feelsLike);
  }

  formatWind(): string {
    return this.settingsService.formatWind(this.weather.windSpeed);
  }

  formatPressure(): string {
    return this.settingsService.formatPressure(this.weather.pressure ?? 1013);
  }
}
