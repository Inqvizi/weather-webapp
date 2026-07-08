import { Component, Input } from '@angular/core';
import { WeatherResponseDto } from '../../services/weather.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-air-conditions',
  imports: [CommonModule],
  templateUrl: './air-conditions.html',
  styleUrl: './air-conditions.css',
})
export class AirConditions {
  @Input({ required: true }) weather!: WeatherResponseDto;
}
