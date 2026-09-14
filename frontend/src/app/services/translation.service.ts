import { computed, inject, Injectable } from '@angular/core';
import { AppLanguage, SettingsService } from './settings.service';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  en: {
    nav: {
      weather: 'Weather',
      cities: 'Cities',
      settings: 'Settings',
      install: 'Install',
      light: 'Light',
      dark: 'Dark',
    },
    search: {
      placeholder: 'Search for cities (e.g. Kyiv, London, Tokyo)',
      loading: 'Searching...',
      recentSearches: 'Recent Searches',
      clearAll: 'Clear all',
      locateMeTitle: 'Use current location',
      locationDenied: 'Location access was denied or is unavailable.',
      locationNotFound: 'Could not determine location.',
    },
    weather: {
      feelsLike: 'Feels like',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      now: 'Now',
      forecast24h: '24-Hour Forecast',
      forecastFor: 'Forecast for',
      backToToday: 'Back to Today',
      forecast7d: '7-Day Forecast',
      today: 'Today',
      precipitationProb: 'Precipitation',
    },
    airConditions: {
      title: 'Air Conditions',
      realFeel: 'Real Feel',
      wind: 'Wind',
      humidity: 'Humidity',
      pressure: 'Pressure',
      uvIndex: 'UV Index',
      sunSchedule: 'Sun Schedule',
      rise: 'Rise',
      set: 'Set',
      uvLow: 'Low',
      uvModerate: 'Moderate',
      uvHigh: 'High',
      uvVeryHigh: 'Very High',
      uvExtreme: 'Extreme',
      windN: 'N',
      windNE: 'NE',
      windE: 'E',
      windSE: 'SE',
      windS: 'S',
      windSW: 'SW',
      windW: 'W',
      windNW: 'NW',
    },
    cities: {
      title: 'Favorite Cities',
      savedCount: 'saved',
      searchPlaceholder: 'Search for a city to add to favorites...',
      emptyTitle: 'No Favorite Cities Yet',
      emptySubtitle: 'Search and add any city to track live weather at a glance.',
      removeFromFavorites: 'Remove from favorites',
      viewWeather: 'Weather in',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize measurement units, time display, and general preferences',
      saved: 'Saved',
      appearance: 'Appearance Theme',
      appearanceDesc: 'Switch between sleek Dark and bright Light mode',
      dark: 'Dark',
      light: 'Light',
      language: 'Language',
      languageDesc: 'Choose your preferred application language',
      tempUnit: 'Temperature Unit',
      tempUnitDesc: 'Choose between Celsius and Fahrenheit',
      windUnit: 'Wind Speed',
      windUnitDesc: 'Select unit for wind velocity',
      pressureUnit: 'Atmospheric Pressure',
      pressureUnitDesc: 'Unit for barometric pressure',
      timeFormat: 'Time Format',
      timeFormatDesc: 'Choose hourly display format',
      defaultCity: 'Default City on Launch',
      defaultCityDesc: 'City loaded automatically when opening the app',
      save: 'Save',
      reset: 'Reset to default settings',
    },
    pwa: {
      offlineMode: 'Offline Mode — Showing cached forecast data',
      iosTitle: 'Install on iPhone / iPad',
      iosGuide: 'Tap',
      iosShare: 'Share',
      iosInSafari: 'in Safari, scroll down and tap',
      iosAddHome: 'Add to Home Screen',
      iosGotIt: 'Got it',
    },
    airQuality: {
      title: 'Air Quality',
      subtitle: 'Real-time air pollution levels & health recommendations',
      standard: 'US AQI',
      index: 'AQI Index',
      good: 'Good',
      moderate: 'Moderate',
      unhealthySensitive: 'Unhealthy for Sensitive Groups',
      unhealthy: 'Unhealthy',
      veryUnhealthy: 'Very Unhealthy',
      hazardous: 'Hazardous',
      adviceGood: 'Air quality is satisfactory, and air pollution poses little or no risk. Ideal for outdoor recreation.',
      adviceModerate: 'Air quality is acceptable. Sensitive individuals may experience mild respiratory symptoms.',
      adviceUnhealthySensitive: 'Members of sensitive groups (children, elderly, asthmatics) should reduce prolonged outdoor exertion.',
      adviceUnhealthy: 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion and close windows.',
      adviceVeryUnhealthy: 'Health alert: serious risk of health effects for the entire population. Avoid outdoor activities.',
      adviceHazardous: 'Emergency conditions: entire population is likely to be affected. Stay indoors with air filtration.',
      pollutants: 'Pollutant Breakdown',
      pm25: 'PM2.5',
      pm25Desc: 'Fine inhalable particles',
      pm10: 'PM10',
      pm10Desc: 'Respirable coarse dust',
      o3: 'Ozone (O₃)',
      o3Desc: 'Ground-level ozone',
      no2: 'NO₂',
      no2Desc: 'Nitrogen dioxide',
      so2: 'SO₂',
      so2Desc: 'Sulphur dioxide',
      co: 'CO',
      coDesc: 'Carbon monoxide',
      unit: 'µg/m³',
    },
  },
  uk: {
    nav: {
      weather: 'Погода',
      cities: 'Міста',
      settings: 'Налаштування',
      install: 'Встановити',
      light: 'Світла',
      dark: 'Темна',
    },
    search: {
      placeholder: 'Пошук міста (напр. Київ, Львів, Лондон)',
      loading: 'Пошук...',
      recentSearches: 'Останні пошуки',
      clearAll: 'Очистити все',
      locateMeTitle: 'Використати поточну геолокацію',
      locationDenied: 'Доступ до геолокації заборонено або недоступний.',
      locationNotFound: 'Не вдалося визначити місцезнаходження.',
    },
    weather: {
      feelsLike: 'Відчувається як',
      addToFavorites: 'Додати до збережених',
      removeFromFavorites: 'Видалити зі збережених',
      now: 'Зараз',
      forecast24h: 'Прогноз на 24 години',
      forecastFor: 'Прогноз на',
      backToToday: 'Сьогодні',
      forecast7d: 'Прогноз на 7 днів',
      today: 'Сьогодні',
      precipitationProb: 'Ймовірність опадів',
    },
    airConditions: {
      title: 'Параметри повітря',
      realFeel: 'Відчувається як',
      wind: 'Вітер',
      humidity: 'Вологість',
      pressure: 'Тиск',
      uvIndex: 'УФ-індекс',
      sunSchedule: 'Схід і захід сонця',
      rise: 'Схід',
      set: 'Захід',
      uvLow: 'Низький',
      uvModerate: 'Помірний',
      uvHigh: 'Високий',
      uvVeryHigh: 'Дуже високий',
      uvExtreme: 'Екстремальний',
      windN: 'Пн',
      windNE: 'Пн-Сх',
      windE: 'Сх',
      windSE: 'Пд-Сх',
      windS: 'Пд',
      windSW: 'Пд-Зх',
      windW: 'Зх',
      windNW: 'Пн-Зх',
    },
    cities: {
      title: 'Збережені міста',
      savedCount: 'збережено',
      searchPlaceholder: 'Шукайте місто для додавання...',
      emptyTitle: 'Немає збережених міст',
      emptySubtitle: 'Знайдіть та додайте будь-яке місто для швидкого відстеження погоди.',
      removeFromFavorites: 'Видалити зі збережених',
      viewWeather: 'Погода у м.',
    },
    settings: {
      title: 'Налаштування',
      subtitle: 'Одиниці вимірювання, мова додатку, формат часу та персональні параметри',
      saved: 'Збережено',
      appearance: 'Тема оформлення',
      appearanceDesc: 'Перемикання між темною та світлою темою',
      dark: 'Темна',
      light: 'Світла',
      language: 'Мова інтерфейсу',
      languageDesc: 'Оберіть бажану мову додатку',
      tempUnit: 'Одиниця температури',
      tempUnitDesc: 'Виберіть шкалу Цельсія або Фаренгейта',
      windUnit: 'Швидкість вітру',
      windUnitDesc: 'Одиниця вимірювання швидкості вітру',
      pressureUnit: 'Атмосферний тиск',
      pressureUnitDesc: 'Одиниця вимірювання тиску повітря',
      timeFormat: 'Формат часу',
      timeFormatDesc: 'Формат відображення годин у прогнозі',
      defaultCity: 'Місто за замовчуванням',
      defaultCityDesc: 'Місто, що завантажується автоматично при відкритті додатку',
      save: 'Зберегти',
      reset: 'Скинути до стандартних налаштувань',
    },
    pwa: {
      offlineMode: 'Офлайн-режим — показано збережені дані прогнозу',
      iosTitle: 'Встановити на iPhone / iPad',
      iosGuide: 'Натисніть',
      iosShare: 'Поділитися',
      iosInSafari: 'у Safari, прокрутіть униз і виберіть',
      iosAddHome: 'На початковий екран',
      iosGotIt: 'Зрозуміло',
    },
    airQuality: {
      title: 'Якість повітря',
      subtitle: 'Рівень забруднення в реальному часі та поради для здоров’я',
      standard: 'US AQI',
      index: 'Індекс AQI',
      good: 'Добре',
      moderate: 'Помірно',
      unhealthySensitive: 'Для чутливих',
      unhealthy: 'Шкідливо',
      veryUnhealthy: 'Дуже шкідливо',
      hazardous: 'Небезпечно',
      adviceGood: 'Якість повітря чиста та безпечна для прогулянок, спорту й провітрювання приміщень.',
      adviceModerate: 'Якість повітря задовільна, проте людям із підвищеною чутливістю варто стежити за самопочуттям.',
      adviceUnhealthySensitive: 'Дітям, літнім людям та особам із захворюваннями дихальних шляхів варто обмежити навантаження на вулиці.',
      adviceUnhealthy: 'Підвищений рівень забруднення. Рекомендується скоротити час перебування на відкритому повітрі та зачинити вікна.',
      adviceVeryUnhealthy: 'Попередження про небезпеку для здоров’я. Уникайте будь-яких фізичних навантажень на свіжому повітрі.',
      adviceHazardous: 'Надзвичайно небезпечні умови. Залишайтеся в приміщенні та увімкніть очищувач повітря.',
      pollutants: 'Склад та концентрація часток',
      pm25: 'PM2.5',
      pm25Desc: 'Дрібнодисперсний пил',
      pm10: 'PM10',
      pm10Desc: 'Грубі завислі частки',
      o3: 'Озон (O₃)',
      o3Desc: 'Приземний озон',
      no2: 'NO₂',
      no2Desc: 'Діоксид азоту',
      so2: 'SO₂',
      so2Desc: 'Діоксид сірки',
      co: 'CO',
      coDesc: 'Чадний газ',
      unit: 'мкг/м³',
    },
  },
};

const WMO_CODE_TRANSLATIONS: Record<number, { en: string; uk: string }> = {
  0: { en: 'Clear sky', uk: 'Ясно' },
  1: { en: 'Mainly clear', uk: 'Переважно ясно' },
  2: { en: 'Partly cloudy', uk: 'Хмарно з проясненнями' },
  3: { en: 'Overcast', uk: 'Суцільна хмарність' },
  45: { en: 'Fog', uk: 'Туман' },
  48: { en: 'Depositing rime fog', uk: 'Туман з памороззю' },
  51: { en: 'Light drizzle', uk: 'Слабка мряка' },
  53: { en: 'Moderate drizzle', uk: 'Мряка' },
  55: { en: 'Dense drizzle', uk: 'Сильна мряка' },
  56: { en: 'Light freezing drizzle', uk: 'Крижана мряка' },
  57: { en: 'Dense freezing drizzle', uk: 'Сильна крижана мряка' },
  61: { en: 'Slight rain', uk: 'Слабкий дощ' },
  63: { en: 'Moderate rain', uk: 'Дощ' },
  65: { en: 'Heavy rain', uk: 'Сильний дощ' },
  66: { en: 'Light freezing rain', uk: 'Крижаний дощ' },
  67: { en: 'Heavy freezing rain', uk: 'Сильний крижаний дощ' },
  71: { en: 'Slight snow fall', uk: 'Слабкий сніг' },
  73: { en: 'Moderate snow fall', uk: 'Сніг' },
  75: { en: 'Heavy snow fall', uk: 'Сильний снігопад' },
  77: { en: 'Snow grains', uk: 'Крупа' },
  80: { en: 'Slight rain showers', uk: 'Короткий дощ' },
  81: { en: 'Moderate rain showers', uk: 'Злива' },
  82: { en: 'Violent rain showers', uk: 'Сильна злива' },
  85: { en: 'Slight snow showers', uk: 'Снігопад' },
  86: { en: 'Heavy snow showers', uk: 'Сильний снігопад' },
  95: { en: 'Thunderstorm', uk: 'Гроза' },
  96: { en: 'Thunderstorm with slight hail', uk: 'Гроза з невеликим градом' },
  99: { en: 'Thunderstorm with heavy hail', uk: 'Гроза з сильним градом' },
};

const UKRAINIAN_DAYS_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const UKRAINIAN_DAYS_FULL = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота'];
const UKRAINIAN_MONTHS_SHORT = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private settingsService = inject(SettingsService);

  readonly currentLanguage = computed<AppLanguage>(() => this.settingsService.settings().language);

  t(path: string): string {
    const lang = this.currentLanguage();
    const parts = path.split('.');
    let current: any = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English
        let fallback: any = TRANSLATIONS.en;
        for (const fPart of parts) {
          if (fallback && typeof fallback === 'object' && fPart in fallback) {
            fallback = fallback[fPart];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }

    return typeof current === 'string' ? current : path;
  }

  translateCondition(code?: number, fallbackDesc?: string): string {
    const lang = this.currentLanguage();

    if (code !== undefined && code !== null && WMO_CODE_TRANSLATIONS[code]) {
      return WMO_CODE_TRANSLATIONS[code][lang];
    }

    if (!fallbackDesc) return '';

    if (lang === 'en') {
      return fallbackDesc;
    }

    // Keyword heuristics if fallback description is in English
    const lower = fallbackDesc.toLowerCase();
    if (lower.includes('thunderstorm') || lower.includes('storm')) return 'Гроза';
    if (lower.includes('heavy rain') || lower.includes('violent rain')) return 'Сильний дощ';
    if (lower.includes('moderate rain')) return 'Помірний дощ';
    if (lower.includes('light rain') || lower.includes('slight rain')) return 'Невеликий дощ';
    if (lower.includes('freezing rain')) return 'Крижаний дощ';
    if (lower.includes('drizzle')) return 'Моросець';
    if (lower.includes('rain') || lower.includes('shower')) return 'Дощ';
    if (lower.includes('heavy snow')) return 'Сильний снігопад';
    if (lower.includes('snow')) return 'Сніг';
    if (lower.includes('clear')) return 'Ясно';
    if (lower.includes('overcast')) return 'Суцільна хмарність';
    if (lower.includes('partly cloudy') || lower.includes('scattered')) return 'Хмарно з проясненнями';
    if (lower.includes('cloud')) return 'Хмарно';
    if (lower.includes('fog') || lower.includes('mist')) return 'Туман';

    return fallbackDesc;
  }

  formatDate(date: Date | string, mode: 'shortDay' | 'dayMonth' | 'weekdayMonth' = 'dayMonth'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const lang = this.currentLanguage();

    if (lang === 'en') {
      if (mode === 'shortDay') {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }
      if (mode === 'weekdayMonth') {
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    // Ukrainian formatting
    const dayOfWeekShort = UKRAINIAN_DAYS_SHORT[d.getDay()];
    const dayOfWeekFull = UKRAINIAN_DAYS_FULL[d.getDay()];
    const dayNumber = d.getDate();
    const monthShort = UKRAINIAN_MONTHS_SHORT[d.getMonth()];

    if (mode === 'shortDay') {
      return dayOfWeekShort;
    }
    if (mode === 'weekdayMonth') {
      return `${dayOfWeekFull}, ${dayNumber} ${monthShort}`;
    }
    return `${dayOfWeekShort}, ${dayNumber} ${monthShort}`;
  }

  translateUvLevel(label: string): string {
    const lang = this.currentLanguage();
    if (lang === 'en') return label;

    switch (label?.toLowerCase()) {
      case 'low': return this.t('airConditions.uvLow');
      case 'moderate': return this.t('airConditions.uvModerate');
      case 'high': return this.t('airConditions.uvHigh');
      case 'very high': return this.t('airConditions.uvVeryHigh');
      case 'extreme': return this.t('airConditions.uvExtreme');
      default: return label;
    }
  }

  translateWindDirection(direction: string): string {
    const lang = this.currentLanguage();
    if (lang === 'en') return direction;

    const map: Record<string, string> = {
      N: 'Пн',
      NE: 'Пн-Сх',
      E: 'Сх',
      SE: 'Пд-Сх',
      S: 'Пд',
      SW: 'Пд-Зх',
      W: 'Зх',
      NW: 'Пн-Зх',
    };

    return map[direction] || direction;
  }
}
