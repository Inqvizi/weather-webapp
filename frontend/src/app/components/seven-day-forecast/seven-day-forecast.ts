import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastResponseDto } from '../../services/weather.service';
import { SettingsService } from '../../services/settings.service';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-seven-day-forecast',
  standalone: true,
  imports: [CommonModule, WeatherIcon],
  templateUrl: './seven-day-forecast.html',
  styleUrl: './seven-day-forecast.css',
})
export class SevenDayForecast {
  @Input({ required: true }) forecast!: ForecastResponseDto;
  @Input() selectedDate: string | null = null;
  @Output() daySelected = new EventEmitter<string>();

  settingsService = inject(SettingsService);

  get dailyForecast() {
    if (this.forecast?.daily && this.forecast.daily.length > 0) {
      return this.forecast.daily.map(d => ({
        date: new Date(d.date + 'T12:00:00'),
        rawDateStr: d.date,
        minTemp: d.minTemp,
        maxTemp: d.maxTemp,
        weatherCode: d.weatherCode,
        iconCode: d.iconCode,
        description: d.description,
        uvIndex: d.uvIndexMax,
        sunrise: d.sunrise,
        sunset: d.sunset
      }));
    }

    if (!this.forecast?.items) return [];

    const daysMap = new Map<string, any>();

    for (const item of this.forecast.items) {
      const dateStr = item.dateTime.split('T')[0];

      if (!daysMap.has(dateStr)) {
        const safeDate = new Date(dateStr + 'T12:00:00');

        daysMap.set(dateStr, {
          date: safeDate,
          rawDateStr: dateStr,
          minTemp: item.temperature,
          maxTemp: item.temperature,
          weatherCode: item.weatherCode,
          iconCode: item.iconCode,
          description: item.description
        });
      } else {
        const day = daysMap.get(dateStr);
        if (item.temperature < day.minTemp) day.minTemp = item.temperature;
        if (item.temperature > day.maxTemp) day.maxTemp = item.temperature;

        if (item.dateTime.includes('12:00') || item.dateTime.includes('14:00') || item.dateTime.includes('15:00')) {
          day.weatherCode = item.weatherCode ?? day.weatherCode;
          day.iconCode = item.iconCode;
          day.description = item.description;
        }
      }
    }

    return Array.from(daysMap.values()).slice(0, 7);
  }

  formatTemp(temp: number): string {
    return this.settingsService.formatTemp(temp);
  }

  onDayClick(dateStr: string) {
    this.daySelected.emit(dateStr);
  }
}

