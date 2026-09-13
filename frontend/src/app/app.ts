import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar, AppTab } from './components/sidebar/sidebar';
import { SearchBar } from './components/search-bar/search-bar';
import { CurrentWeather } from './components/current-weather/current-weather';
import { HourlyForecast } from './components/hourly-forecast/hourly-forecast';
import { AirConditions } from './components/air-conditions/air-conditions';
import { SevenDayForecast } from './components/seven-day-forecast/seven-day-forecast';
import { CitiesComponent } from './components/cities/cities';
import { SettingsComponent } from './components/settings/settings';
import { WeatherService, WeatherResponseDto, ForecastResponseDto } from './services/weather.service';
import { SettingsService } from './services/settings.service';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    SearchBar,
    CurrentWeather,
    HourlyForecast,
    AirConditions,
    SevenDayForecast,
    CitiesComponent,
    SettingsComponent,
  ],
  templateUrl: './app.html',
})
export class App implements OnInit {
  activeTab = signal<AppTab>('weather');
  currentWeather = signal<WeatherResponseDto | null>(null);
  forecast = signal<ForecastResponseDto | null>(null);
  errorMessage = signal<string | null>(null);
  selectedDate = signal<string | null>(null);

  weatherService = inject(WeatherService);
  settingsService = inject(SettingsService);
  pwaService = inject(PwaService);

  ngOnInit() {
    const startupCity = this.settingsService.settings().defaultCity || 'Lviv';
    this.searchCity(startupCity);
  }

  onTabChange(tab: AppTab) {
    this.activeTab.set(tab);
  }

  onCityFromList(city: string) {
    this.searchCity(city);
    this.activeTab.set('weather');
    this.scrollToHourlyForecast();
  }

  onDaySelected(date: string) {
    this.selectedDate.set(date);
    this.scrollToHourlyForecast();
  }

  scrollToHourlyForecast() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const el = document.getElementById('hourly-forecast-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
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
        if (err?.status !== 404) {
          this.errorMessage.set('Unable to load weather forecast.');
        }
      }
    });
  }

  searchByCoordinates(coords: { latitude: number; longitude: number; cityName?: string }) {
    this.errorMessage.set(null);
    this.currentWeather.set(null);
    this.selectedDate.set(null);

    this.weatherService.getCurrentWeatherByCoordinates(coords.latitude, coords.longitude, coords.cityName).subscribe({
      next: (data) => {
        this.currentWeather.set(data);
      },
      error: () => {
        this.errorMessage.set('Unable to load weather data for your coordinates.');
      }
    });

    this.weatherService.getForecastByCoordinates(coords.latitude, coords.longitude, coords.cityName).subscribe({
      next: (data) => {
        this.forecast.set(data);
      },
      error: () => {
        this.errorMessage.set('Unable to load weather forecast for your coordinates.');
      }
    });
  }
}

