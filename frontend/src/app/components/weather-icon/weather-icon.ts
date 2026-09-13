import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type WeatherIconType =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'rain-showers-day'
  | 'rain-showers-night'
  | 'thunderstorm';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-icon.html',
  styleUrl: './weather-icon.css',
})
export class WeatherIcon {
  @Input() weatherCode: number | null | undefined = 0;
  @Input() isDay: boolean = true;
  @Input() iconCode: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' = 'md';
  @Input() customClass: string = '';

  iconType = computed<WeatherIconType>(() => {
    const code = this.weatherCode ?? this.mapIconCodeToWmo(this.iconCode);
    const day = this.isDay !== undefined ? this.isDay : !this.iconCode?.includes('n');

    // WMO 0: Clear sky
    if (code === 0) {
      return day ? 'clear-day' : 'clear-night';
    }

    // WMO 1, 2: Mainly clear, partly cloudy
    if (code === 1 || code === 2) {
      return day ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }

    // WMO 3: Overcast
    if (code === 3) {
      return 'overcast';
    }

    // WMO 45, 48: Fog
    if (code === 45 || code === 48) {
      return 'fog';
    }

    // WMO 51, 53, 55, 56, 57: Drizzle
    if ([51, 53, 55, 56, 57].includes(code)) {
      return 'drizzle';
    }

    // WMO 61, 63, 65, 66, 67: Rain
    if ([61, 63, 65, 66, 67].includes(code)) {
      return 'rain';
    }

    // WMO 71, 73, 75, 77: Snow
    if ([71, 73, 75, 77].includes(code)) {
      return 'snow';
    }

    // WMO 80, 81, 82: Rain showers
    if ([80, 81, 82].includes(code)) {
      return day ? 'rain-showers-day' : 'rain-showers-night';
    }

    // WMO 85, 86: Snow showers
    if (code === 85 || code === 86) {
      return 'snow';
    }

    // WMO 95, 96, 99: Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return 'thunderstorm';
    }

    return day ? 'clear-day' : 'clear-night';
  });

  get sizeClass(): string {
    switch (this.size) {
      case 'xs':
        return 'w-4 h-4';
      case 'sm':
        return 'w-6 h-6';
      case 'md':
        return 'w-9 h-9';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case 'hero':
        return 'w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44';
      default:
        return 'w-9 h-9';
    }
  }

  private mapIconCodeToWmo(iconCode: string): number {
    if (!iconCode) return 0;
    if (iconCode.startsWith('01')) return 0;
    if (iconCode.startsWith('02')) return 2;
    if (iconCode.startsWith('03') || iconCode.startsWith('04')) return 3;
    if (iconCode.startsWith('09')) return 61;
    if (iconCode.startsWith('10')) return 80;
    if (iconCode.startsWith('11')) return 95;
    if (iconCode.startsWith('13')) return 71;
    if (iconCode.startsWith('50')) return 45;
    return 0;
  }
}
