import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherResponseDto {
  cityName: string;
  countryCode: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  pressure?: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  isDay?: boolean;
  weatherCode?: number;
  description: string;
  iconCode: string;
  measuredAt: string;
  latitude?: number;
  longitude?: number;
  airQuality?: AirQualityDto;
}

export interface ForecastItemDto {
  dateTime: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  pressure?: number;
  precipitationProbability?: number;
  isDay?: boolean;
  weatherCode?: number;
  description: string;
  iconCode: string;
}

export interface DailyForecastItemDto {
  date: string;
  weatherCode: number;
  description: string;
  iconCode: string;
  minTemp: number;
  maxTemp: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface AirQualityDto {
  europeanAqi: number;
  usAqi: number;
  category: string;
  pm10: number;
  pm25: number;
  carbonMonoxide: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  ozone: number;
}

export interface ForecastResponseDto {
  cityName: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  items: ForecastItemDto[];
  daily?: DailyForecastItemDto[];
  airQuality?: AirQualityDto;
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
  private apiUrl = (typeof window !== 'undefined' && localStorage.getItem('weather_app_api_url')) 
    || environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherResponseDto> {
    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}`);
  }

  getForecast(city: string): Observable<ForecastResponseDto> {
    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}/forecast`);
  }

  getCurrentWeatherByCoordinates(latitude: number, longitude: number, cityName?: string): Observable<WeatherResponseDto> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());

    if (cityName) {
      params = params.set('cityName', cityName);
    }

    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/by-coordinates`, { params });
  }

  getForecastByCoordinates(latitude: number, longitude: number, cityName?: string): Observable<ForecastResponseDto> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());

    if (cityName) {
      params = params.set('cityName', cityName);
    }

    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/by-coordinates/forecast`, { params });
  }

  searchCities(query: string, language: string = 'en'): Observable<CitySearchResultDto[]> {
    const params = new HttpParams()
      .set('query', query.trim())
      .set('language', language);

    return this.http.get<CitySearchResultDto[]>(`${this.apiUrl}/search`, { params });
  }

  reverseGeocode(latitude: number, longitude: number): Observable<any> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    return this.http.get<any>(url);
  }

  getAirQuality(city: string): Observable<AirQualityDto> {
    return this.http.get<AirQualityDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}/air-quality`);
  }

  getAirQualityByCoordinates(latitude: number, longitude: number): Observable<AirQualityDto> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    return this.http.get<AirQualityDto>(`${this.apiUrl}/by-coordinates/air-quality`, { params });
  }
}

