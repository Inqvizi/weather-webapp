import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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

function getWmoDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] || 'Unknown';
}

function getWmoIconCode(code: number, isDay: boolean = true): string {
  const baseMap: Record<number, string> = {
    0: '01',
    1: '01',
    2: '02',
    3: '04',
    45: '50',
    48: '50',
    51: '10',
    53: '10',
    55: '10',
    56: '10',
    57: '10',
    61: '10',
    63: '09',
    65: '09',
    66: '13',
    67: '13',
    71: '13',
    73: '13',
    75: '13',
    77: '13',
    80: '10',
    81: '09',
    82: '09',
    85: '13',
    86: '13',
    95: '11',
    96: '11',
    99: '11',
  };
  const base = baseMap[code] || '03';
  const suffix = isDay ? 'd' : 'n';
  if (['01', '02', '10'].includes(base)) {
    return `${base}${suffix}`;
  }
  return `${base}d`;
}

function getAirQualityCategory(usAqi: number): string {
  if (usAqi <= 50) return 'Good';
  if (usAqi <= 100) return 'Moderate';
  if (usAqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (usAqi <= 200) return 'Unhealthy';
  if (usAqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = (typeof window !== 'undefined' && localStorage.getItem('weather_app_api_url')) 
    || environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherResponseDto> {
    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}`).pipe(
      catchError(err => {
        console.warn(`[WeatherService] Backend returned error for city "${city}". Initiating direct Open-Meteo fallback.`, err);
        return this.fallbackDirectCurrentWeather(city);
      })
    );
  }

  getForecast(city: string): Observable<ForecastResponseDto> {
    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}/forecast`).pipe(
      catchError(err => {
        console.warn(`[WeatherService] Backend returned error for forecast "${city}". Initiating direct Open-Meteo fallback.`, err);
        return this.fallbackDirectForecast(city);
      })
    );
  }

  getCurrentWeatherByCoordinates(latitude: number, longitude: number, cityName?: string): Observable<WeatherResponseDto> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());

    if (cityName) {
      params = params.set('cityName', cityName);
    }

    return this.http.get<WeatherResponseDto>(`${this.apiUrl}/by-coordinates`, { params }).pipe(
      catchError(err => {
        console.warn('[WeatherService] Backend by-coordinates failed. Initiating direct Open-Meteo fallback.', err);
        return this.directGetWeatherByCoordinates(latitude, longitude, cityName || 'Current Location');
      })
    );
  }

  getForecastByCoordinates(latitude: number, longitude: number, cityName?: string): Observable<ForecastResponseDto> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());

    if (cityName) {
      params = params.set('cityName', cityName);
    }

    return this.http.get<ForecastResponseDto>(`${this.apiUrl}/by-coordinates/forecast`, { params }).pipe(
      catchError(err => {
        console.warn('[WeatherService] Backend forecast by-coordinates failed. Initiating direct Open-Meteo fallback.', err);
        return this.directGetForecastByCoordinates(latitude, longitude, cityName || 'Current Location');
      })
    );
  }

  searchCities(query: string, language: string = 'en'): Observable<CitySearchResultDto[]> {
    const params = new HttpParams()
      .set('query', query.trim())
      .set('language', language);

    return this.http.get<CitySearchResultDto[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(err => {
        console.warn('[WeatherService] Backend search failed. Falling back to direct geocoding.', err);
        return this.directSearchCities(query, language);
      })
    );
  }

  reverseGeocode(latitude: number, longitude: number): Observable<any> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    return this.http.get<any>(url);
  }

  getAirQuality(city: string): Observable<AirQualityDto> {
    return this.http.get<AirQualityDto>(`${this.apiUrl}/${encodeURIComponent(city.trim())}/air-quality`).pipe(
      catchError(err => {
        return this.directSearchCities(city).pipe(
          switchMap(results => {
            if (!results || results.length === 0) {
              return throwError(() => err);
            }
            return this.directGetAirQuality(results[0].latitude, results[0].longitude);
          })
        );
      })
    );
  }

  getAirQualityByCoordinates(latitude: number, longitude: number): Observable<AirQualityDto> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    return this.http.get<AirQualityDto>(`${this.apiUrl}/by-coordinates/air-quality`, { params }).pipe(
      catchError(() => this.directGetAirQuality(latitude, longitude))
    );
  }

  // --- Direct Open-Meteo Fallback Implementations ---

  private fallbackDirectCurrentWeather(city: string): Observable<WeatherResponseDto> {
    return this.directSearchCities(city).pipe(
      switchMap(results => {
        if (!results || results.length === 0) {
          return throwError(() => ({ status: 404, message: `City "${city}" not found.` }));
        }
        const first = results[0];
        return this.directGetWeatherByCoordinates(first.latitude, first.longitude, first.name, first.countryCode);
      })
    );
  }

  private fallbackDirectForecast(city: string): Observable<ForecastResponseDto> {
    return this.directSearchCities(city).pipe(
      switchMap(results => {
        if (!results || results.length === 0) {
          return throwError(() => ({ status: 404, message: `City "${city}" not found.` }));
        }
        const first = results[0];
        return this.directGetForecastByCoordinates(first.latitude, first.longitude, first.name, first.countryCode);
      })
    );
  }

  public directSearchCities(query: string, language: string = 'en'): Observable<CitySearchResultDto[]> {
    if (!query || !query.trim()) {
      return of([]);
    }
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=${language}&format=json`;
    return this.http.get<any>(url).pipe(
      map(res => {
        if (!res?.results || !Array.isArray(res.results)) {
          return [];
        }
        return res.results.map((r: any) => ({
          name: r.name,
          country: r.country || '',
          countryCode: r.country_code || '',
          adminRegion: r.admin1 || '',
          latitude: r.latitude,
          longitude: r.longitude
        }));
      }),
      catchError(() => of([]))
    );
  }

  public directGetWeatherByCoordinates(
    latitude: number,
    longitude: number,
    cityName: string = 'Current Location',
    countryCode: string = ''
  ): Observable<WeatherResponseDto> {
    const lat = latitude.toFixed(5);
    const lon = longitude.toFixed(5);
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

    return forkJoin({
      weather: this.http.get<any>(weatherUrl),
      aq: this.directGetAirQuality(latitude, longitude)
    }).pipe(
      map(({ weather, aq }) => {
        const cur = weather.current || {};
        const daily = weather.daily || {};
        const isDay = cur.is_day === 1;
        const code = cur.weather_code ?? 0;

        return {
          cityName,
          countryCode,
          temperature: cur.temperature_2m ?? 0,
          feelsLike: cur.apparent_temperature ?? 0,
          humidity: cur.relative_humidity_2m ?? 0,
          windSpeed: cur.wind_speed_10m ?? 0,
          windDirection: cur.wind_direction_10m ?? 0,
          pressure: Math.round(cur.surface_pressure ?? 1013),
          uvIndex: daily.uv_index_max?.[0] ?? 0,
          sunrise: daily.sunrise?.[0] ?? '',
          sunset: daily.sunset?.[0] ?? '',
          isDay,
          weatherCode: code,
          description: getWmoDescription(code),
          iconCode: getWmoIconCode(code, isDay),
          measuredAt: cur.time || new Date().toISOString(),
          latitude,
          longitude,
          airQuality: aq
        };
      })
    );
  }

  public directGetForecastByCoordinates(
    latitude: number,
    longitude: number,
    cityName: string = 'Current Location',
    countryCode: string = ''
  ): Observable<ForecastResponseDto> {
    const lat = latitude.toFixed(5);
    const lon = longitude.toFixed(5);
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

    return forkJoin({
      forecast: this.http.get<any>(forecastUrl),
      aq: this.directGetAirQuality(latitude, longitude)
    }).pipe(
      map(({ forecast, aq }) => {
        const hourly = forecast.hourly || {};
        const times: string[] = hourly.time || [];
        const items: ForecastItemDto[] = times.map((t, idx) => {
          const isDay = (hourly.is_day?.[idx] ?? 1) === 1;
          const code = hourly.weather_code?.[idx] ?? 0;
          return {
            dateTime: t,
            temperature: hourly.temperature_2m?.[idx] ?? 0,
            feelsLike: hourly.apparent_temperature?.[idx] ?? 0,
            humidity: hourly.relative_humidity_2m?.[idx] ?? 0,
            windSpeed: hourly.wind_speed_10m?.[idx] ?? 0,
            windDirection: hourly.wind_direction_10m?.[idx] ?? 0,
            pressure: Math.round(hourly.surface_pressure?.[idx] ?? 1013),
            precipitationProbability: hourly.precipitation_probability?.[idx] ?? 0,
            isDay,
            weatherCode: code,
            description: getWmoDescription(code),
            iconCode: getWmoIconCode(code, isDay)
          };
        });

        const dailyObj = forecast.daily || {};
        const dailyTimes: string[] = dailyObj.time || [];
        const daily: DailyForecastItemDto[] = dailyTimes.map((d, idx) => {
          const code = dailyObj.weather_code?.[idx] ?? 0;
          return {
            date: d,
            weatherCode: code,
            description: getWmoDescription(code),
            iconCode: getWmoIconCode(code, true),
            minTemp: dailyObj.temperature_2m_min?.[idx] ?? 0,
            maxTemp: dailyObj.temperature_2m_max?.[idx] ?? 0,
            sunrise: dailyObj.sunrise?.[idx] ?? '',
            sunset: dailyObj.sunset?.[idx] ?? '',
            uvIndexMax: dailyObj.uv_index_max?.[idx] ?? 0
          };
        });

        return {
          cityName,
          countryCode,
          latitude,
          longitude,
          items,
          daily,
          airQuality: aq
        };
      })
    );
  }

  public directGetAirQuality(latitude: number, longitude: number): Observable<AirQualityDto> {
    const lat = latitude.toFixed(5);
    const lon = longitude.toFixed(5);
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const cur = res?.current || {};
        const usAqi = Math.round(cur.us_aqi ?? 0);
        return {
          europeanAqi: Math.round(cur.european_aqi ?? 0),
          usAqi,
          category: getAirQualityCategory(usAqi),
          pm10: Number((cur.pm10 ?? 0).toFixed(1)),
          pm25: Number((cur.pm2_5 ?? 0).toFixed(1)),
          carbonMonoxide: Math.round(cur.carbon_monoxide ?? 0),
          nitrogenDioxide: Number((cur.nitrogen_dioxide ?? 0).toFixed(1)),
          sulphurDioxide: Number((cur.sulphur_dioxide ?? 0).toFixed(1)),
          ozone: Math.round(cur.ozone ?? 0)
        };
      }),
      catchError(() => of({
        europeanAqi: 0,
        usAqi: 0,
        category: 'Good',
        pm10: 0,
        pm25: 0,
        carbonMonoxide: 0,
        nitrogenDioxide: 0,
        sulphurDioxide: 0,
        ozone: 0
      }))
    );
  }
}


