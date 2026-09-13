import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastResponseDto } from '../../services/weather.service';
import { SettingsService } from '../../services/settings.service';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule, WeatherIcon],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.css',
})
export class HourlyForecast {

  @Input({ required: true }) forecast!: ForecastResponseDto;
  @Input() selectedDate: string | null = null;
  @Output() clearSelectedDate = new EventEmitter<void>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  settingsService = inject(SettingsService);

  get nextHours() {
    if (!this.forecast?.items || this.forecast.items.length === 0) return [];

    if (this.selectedDate) {
      return this.forecast.items.filter(item => item.dateTime.startsWith(this.selectedDate!));
    }

    const now = new Date();
    const nowTime = now.getTime();
    
    // Find index of the hour closest to or immediately before current time (so user sees current hour first)
    const currentIndex = this.forecast.items.findIndex(item => {
      const itemTime = new Date(item.dateTime).getTime();
      return itemTime >= nowTime - 3600000;
    });

    if (currentIndex >= 0) {
      return this.forecast.items.slice(currentIndex, currentIndex + 24);
    }

    return this.forecast.items.slice(0, 24);
  }

  get isFilteredByDate(): boolean {
    return !!this.selectedDate;
  }

  formatHour(dateTimeStr: string, index: number): string {
    if (!this.selectedDate && index === 0) {
      return 'Now';
    }
    return this.settingsService.formatTime(dateTimeStr);
  }

  formatTemp(temp: number): string {
    return this.settingsService.formatTemp(temp);
  }

  scrollLeft(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }

  resetToToday(): void {
    this.clearSelectedDate.emit();
  }
}

