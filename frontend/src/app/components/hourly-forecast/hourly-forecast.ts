import { Component, Input } from '@angular/core';
import { ForecastResponseDto } from '../../services/weather.service';
import { getIconClass, getIconColor } from '../../utils/icon.mapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hourly-forecast',
  imports: [CommonModule],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.css',
})
export class HourlyForecast {
  @Input({ required: true }) forecast!: ForecastResponseDto;
  @Input() selectedDate: string | null = null;

  get nextHours() {
    if (!this.forecast?.items) return [];

    if (this.selectedDate) {
      
      return this.forecast.items.filter(item => item.dateTime.startsWith(this.selectedDate!));
    }

    
    return this.forecast.items.slice(0, 8);
  }

  getIcon(code: string, desc: string) { return getIconClass(code, desc); }
  getColor(code: string, desc: string) { return getIconColor(code, desc); }
}
