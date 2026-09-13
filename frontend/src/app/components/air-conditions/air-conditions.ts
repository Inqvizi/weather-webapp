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

  get windCompass(): string {
    const deg = this.weather.windDirection ?? 0;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((deg % 360) / 45) % 8;
    return directions[index];
  }

  get windRotation(): number {
    return this.weather.windDirection ?? 0;
  }

  get uvInfo(): { label: string; badgeClass: string } {
    const uv = this.weather.uvIndex ?? 0;
    if (uv <= 2.9) {
      return { label: 'Low', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (uv <= 5.9) {
      return { label: 'Moderate', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    if (uv <= 7.9) {
      return { label: 'High', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    }
    if (uv <= 10.9) {
      return { label: 'Very High', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    return { label: 'Extreme', badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  }

  get formattedSunrise(): string {
    return this.weather.sunrise ? this.settingsService.formatTime(this.weather.sunrise) : '--:--';
  }

  get formattedSunset(): string {
    return this.weather.sunset ? this.settingsService.formatTime(this.weather.sunset) : '--:--';
  }
}
