import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { runInInjectionContext, Injector } from '@angular/core';
import { AirQualityComponent } from './air-quality';
import { TranslationService } from '../../services/translation.service';
import { SettingsService } from '../../services/settings.service';

describe('AirQualityComponent Class Logic', () => {
  function createComponent(): AirQualityComponent {
    const injector = Injector.create({
      providers: [
        { provide: SettingsService, useClass: SettingsService },
        { provide: TranslationService, useClass: TranslationService },
      ],
    });

    return runInInjectionContext(injector, () => new AirQualityComponent());
  }

  it('should correctly determine Good AQI status (<= 50)', () => {
    const comp = createComponent();
    comp.airQuality = {
      usAqi: 35,
      europeanAqi: 20,
      category: 'Good',
      pm10: 8,
      pm25: 4.5,
      carbonMonoxide: 150,
      nitrogenDioxide: 5,
      sulphurDioxide: 1,
      ozone: 40,
    };

    expect(comp.aqiInfo.statusKey).toBe('airQuality.good');
    expect(comp.aqiInfo.textClass).toContain('text-emerald-400');
  });

  it('should correctly determine Moderate AQI status (51 - 100)', () => {
    const comp = createComponent();
    comp.airQuality = {
      usAqi: 75,
      europeanAqi: 45,
      category: 'Moderate',
      pm10: 25,
      pm25: 18,
      carbonMonoxide: 220,
      nitrogenDioxide: 20,
      sulphurDioxide: 5,
      ozone: 80,
    };

    expect(comp.aqiInfo.statusKey).toBe('airQuality.moderate');
    expect(comp.aqiInfo.textClass).toContain('text-amber-400');
  });

  it('should correctly determine Unhealthy AQI status (151 - 200)', () => {
    const comp = createComponent();
    comp.airQuality = {
      usAqi: 165,
      europeanAqi: 85,
      category: 'Unhealthy',
      pm10: 90,
      pm25: 65,
      carbonMonoxide: 500,
      nitrogenDioxide: 70,
      sulphurDioxide: 25,
      ozone: 140,
    };

    expect(comp.aqiInfo.statusKey).toBe('airQuality.unhealthy');
    expect(comp.aqiInfo.textClass).toContain('text-rose-400');
  });

  it('should correctly determine Hazardous AQI status (> 300)', () => {
    const comp = createComponent();
    comp.airQuality = {
      usAqi: 350,
      europeanAqi: 120,
      category: 'Hazardous',
      pm10: 250,
      pm25: 180,
      carbonMonoxide: 1200,
      nitrogenDioxide: 150,
      sulphurDioxide: 60,
      ozone: 220,
    };

    expect(comp.aqiInfo.statusKey).toBe('airQuality.hazardous');
    expect(comp.aqiInfo.textClass).toContain('text-red-400');
  });

  it('should generate 6 pollutant cards with correct values and keys', () => {
    const comp = createComponent();
    comp.airQuality = {
      usAqi: 30,
      europeanAqi: 25,
      category: 'Good',
      pm10: 10.5,
      pm25: 6.2,
      carbonMonoxide: 150,
      nitrogenDioxide: 12.3,
      sulphurDioxide: 2.1,
      ozone: 55.4,
    };

    const pollutants = comp.pollutants;
    expect(pollutants.length).toBe(6);
    expect(pollutants.map((p) => p.key)).toEqual(['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']);
    expect(pollutants.find((p) => p.key === 'pm25')?.value).toBe('6.2');
    expect(pollutants.find((p) => p.key === 'pm10')?.value).toBe('10.5');
  });
});
