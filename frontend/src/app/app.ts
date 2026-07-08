import { Component, OnInit, signal } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { SearchBar } from './components/search-bar/search-bar';
import { CurrentWeather } from './components/current-weather/current-weather';
import { HourlyForecast } from './components/hourly-forecast/hourly-forecast';
import { AirConditions } from './components/air-conditions/air-conditions';
import { SevenDayForecast } from './components/seven-day-forecast/seven-day-forecast';
import { WeatherService, WeatherResponseDto, ForecastResponseDto } from './services/weather.service';

@Component({
  selector: 'app-root',
  imports: [Sidebar, SearchBar, CurrentWeather, HourlyForecast, AirConditions, SevenDayForecast],
  templateUrl: './app.html',
})
export class App implements OnInit {
  currentWeather = signal<WeatherResponseDto | null>(null);
  forecast = signal<ForecastResponseDto | null>(null);
  errorMessage = signal<string | null>(null);
  selectedDate = signal<string | null>(null);

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.searchCity('Lviv');
  }

  searchCity(city: string) {
    this.errorMessage.set(null);
    this.currentWeather.set(null);
    this.selectedDate.set(null);

    this.weatherService.getCurrentWeather(city).subscribe({
      next: (data) => {
        this.currentWeather.set(data);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.errorMessage.set('City not found. Please try again.');
        } else {
          this.errorMessage.set('Unable to load weather data at this time. Please try again later.');
        }
      }
    });

    this.weatherService.getForecast(city).subscribe({
      next: (data) => {
        this.forecast.set(data);
      },
      error: (err) => {
        // We can just log or set a generic message, but usually the current weather error handles the UI state.
        if (err?.status !== 404) {
          this.errorMessage.set('Unable to load weather forecast.');
        }
      }
    });
  }
}
