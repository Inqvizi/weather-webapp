import { Injectable, signal } from '@angular/core';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph';
export type PressureUnit = 'hPa' | 'mmHg';
export type TimeFormat = '24h' | '12h';
export type ThemeMode = 'dark' | 'light';
export type AppLanguage = 'en' | 'uk';

export interface AppSettings {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  timeFormat: TimeFormat;
  defaultCity: string;
  theme: ThemeMode;
  language: AppLanguage;
}

const DEFAULT_SETTINGS: AppSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hPa',
  timeFormat: '24h',
  defaultCity: 'Lviv',
  theme: 'dark',
  language: 'uk',
};

const STORAGE_KEY = 'weatherapp_settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly settings = signal<AppSettings>(this.loadSettings());

  constructor() {
    this.applyTheme(this.settings().theme);
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore JSON parse or localStorage security errors
    }
    return { ...DEFAULT_SETTINGS };
  }


  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
    this.settings.set(settings);
  }

  setTemperatureUnit(unit: TemperatureUnit): void {
    this.saveSettings({ ...this.settings(), temperatureUnit: unit });
  }

  setWindSpeedUnit(unit: WindSpeedUnit): void {
    this.saveSettings({ ...this.settings(), windSpeedUnit: unit });
  }

  setPressureUnit(unit: PressureUnit): void {
    this.saveSettings({ ...this.settings(), pressureUnit: unit });
  }

  setTimeFormat(format: TimeFormat): void {
    this.saveSettings({ ...this.settings(), timeFormat: format });
  }

  setDefaultCity(city: string): void {
    const trimmed = city.trim();
    if (trimmed) {
      this.saveSettings({ ...this.settings(), defaultCity: trimmed });
    }
  }

  setTheme(theme: ThemeMode): void {
    this.saveSettings({ ...this.settings(), theme });
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const next = this.settings().theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setLanguage(language: AppLanguage): void {
    this.saveSettings({ ...this.settings(), language });
  }

  applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    }
  }

  resetToDefaults(): void {
    this.saveSettings({ ...DEFAULT_SETTINGS });
    this.applyTheme(DEFAULT_SETTINGS.theme);
  }


  // Formatters
  formatTemp(celsius: number): string {
    if (celsius === null || celsius === undefined) return '--';
    if (this.settings().temperatureUnit === 'fahrenheit') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}`;
    }
    return `${Math.round(celsius)}`;
  }

  formatTempWithUnit(celsius: number): string {
    const val = this.formatTemp(celsius);
    const unit = this.settings().temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    return `${val}${unit}`;
  }

  formatWind(kmh: number): string {
    if (kmh === null || kmh === undefined) return '--';
    switch (this.settings().windSpeedUnit) {
      case 'ms':
        return `${(kmh / 3.6).toFixed(1)} m/s`;
      case 'mph':
        return `${(kmh * 0.621371).toFixed(1)} mph`;
      case 'kmh':
      default:
        return `${kmh.toFixed(1)} km/h`;
    }
  }

  formatPressure(hPa: number): string {
    if (hPa === null || hPa === undefined) return '--';
    if (this.settings().pressureUnit === 'mmHg') {
      return `${Math.round(hPa * 0.750062)} mmHg`;
    }
    return `${Math.round(hPa)} hPa`;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    try {
      // Use substring if it follows YYYY-MM-DDTHH:mm
      let hour = 0;
      let minute = 0;

      if (isoString.includes('T')) {
        const timePart = isoString.split('T')[1];
        const [h, m] = timePart.split(':');
        hour = parseInt(h, 10);
        minute = parseInt(m, 10);
      } else {
        const date = new Date(isoString);
        hour = date.getHours();
        minute = date.getMinutes();
      }

      if (this.settings().timeFormat === '12h') {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const mm = minute.toString().padStart(2, '0');
        return `${displayHour}:${mm} ${period}`;
      }

      const hh = hour.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');
      return `${hh}:${mm}`;
    } catch {
      return isoString;
    }
  }
}
