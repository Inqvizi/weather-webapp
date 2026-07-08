import { Component, Input } from '@angular/core';
import { WeatherResponseDto } from '../../services/weather.service';
import { getIconClass, getIconColor } from '../../utils/icon.mapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-weather',
  imports: [CommonModule],
  templateUrl: './current-weather.html',
  styleUrl: './current-weather.css',
})
export class CurrentWeather {
  @Input({ required: true }) weather!: WeatherResponseDto;

  get iconClass() {
    return getIconClass(this.weather?.iconCode, this.weather?.description);
  }

  get colorClass() {
    return getIconColor(this.weather?.iconCode, this.weather?.description);
  }
}
