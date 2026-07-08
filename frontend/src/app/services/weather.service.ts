import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherResponseDto {
  cityName: string;
  countryCode: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  description: string;
  iconCode: string;
  measuredAt: string;
}
export interface ForecastItemDto {
  dateTime: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  iconCode: string;
}
export interface ForecastResponseDto {
  cityName: string;
  countryCode: string;
  items: ForecastItemDto[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://localhost:7065/api/Weather';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherResponseDto> {
    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/${city}`);
  }

  getForecast(city: string): Observable<ForecastResponseDto> {
    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/${city}/forecast`);
  }
}
