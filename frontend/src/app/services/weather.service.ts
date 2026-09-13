import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  latitude?: number;
  longitude?: number;
}

export interface ForecastItemDto {
  dateTime: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  description: string;
  iconCode: string;
}

export interface ForecastResponseDto {
  cityName: string;
  countryCode: string;
  items: ForecastItemDto[];
}

export interface CitySearchResultDto {
  name: string;
  country: string;
  countryCode: string;
  adminRegion: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://localhost:7065/api/Weather';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherResponseDto> {
    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}`);
  }

  getForecast(city: string): Observable<ForecastResponseDto> {
    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}/forecast`);
  }

  searchCities(query: string, language: string = 'uk'): Observable<CitySearchResultDto[]> {
    const params = new HttpParams()
      .set('query', query.trim())
      .set('language', language);

    return this.http.get<CitySearchResultDto[]>(`${this.apiUrl}/search`, { params });
  }
}
