import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirQualityDto } from '../../services/weather.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface AqiStatusInfo {
  statusKey: string;
  adviceKey: string;
  badgeClass: string;
  textClass: string;
  glowClass: string;
  barColorClass: string;
  markerPositionPercent: number;
}

export interface PollutantCard {
  key: string;
  nameKey: string;
  descKey: string;
  value: string;
  unit: string;
  badgeClass: string;
  badgeLabelKey: string;
}

@Component({
  selector: 'app-air-quality',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './air-quality.html',
  styleUrl: './air-quality.css',
})
export class AirQualityComponent {
  @Input() airQuality?: AirQualityDto | null;

  translationService = inject(TranslationService);

  get aqiInfo(): AqiStatusInfo {
    const aqi = this.airQuality?.usAqi ?? 0;
    const clampedPercent = Math.min(Math.max((aqi / 300) * 100, 4), 100);

    if (aqi <= 50) {
      return {
        statusKey: 'airQuality.good',
        adviceKey: 'airQuality.adviceGood',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        textClass: 'text-emerald-400',
        glowClass: 'shadow-emerald-500/10 border-emerald-500/20',
        barColorClass: 'bg-emerald-400',
        markerPositionPercent: clampedPercent,
      };
    }

    if (aqi <= 100) {
      return {
        statusKey: 'airQuality.moderate',
        adviceKey: 'airQuality.adviceModerate',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        textClass: 'text-amber-400',
        glowClass: 'shadow-amber-500/10 border-amber-500/20',
        barColorClass: 'bg-amber-400',
        markerPositionPercent: clampedPercent,
      };
    }

    if (aqi <= 150) {
      return {
        statusKey: 'airQuality.unhealthySensitive',
        adviceKey: 'airQuality.adviceUnhealthySensitive',
        badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        textClass: 'text-orange-400',
        glowClass: 'shadow-orange-500/10 border-orange-500/20',
        barColorClass: 'bg-orange-400',
        markerPositionPercent: clampedPercent,
      };
    }

    if (aqi <= 200) {
      return {
        statusKey: 'airQuality.unhealthy',
        adviceKey: 'airQuality.adviceUnhealthy',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        textClass: 'text-rose-400',
        glowClass: 'shadow-rose-500/10 border-rose-500/20',
        barColorClass: 'bg-rose-500',
        markerPositionPercent: clampedPercent,
      };
    }

    if (aqi <= 300) {
      return {
        statusKey: 'airQuality.veryUnhealthy',
        adviceKey: 'airQuality.adviceVeryUnhealthy',
        badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        textClass: 'text-purple-400',
        glowClass: 'shadow-purple-500/10 border-purple-500/20',
        barColorClass: 'bg-purple-500',
        markerPositionPercent: clampedPercent,
      };
    }

    return {
      statusKey: 'airQuality.hazardous',
      adviceKey: 'airQuality.adviceHazardous',
      badgeClass: 'bg-red-950/40 text-red-300 border-red-800/50',
      textClass: 'text-red-400',
      glowClass: 'shadow-red-500/10 border-red-800/30',
      barColorClass: 'bg-red-700',
      markerPositionPercent: clampedPercent,
    };
  }

  get pollutants(): PollutantCard[] {
    const aq = this.airQuality;
    const unit = this.translationService.t('airQuality.unit');

    return [
      {
        key: 'pm25',
        nameKey: 'airQuality.pm25',
        descKey: 'airQuality.pm25Desc',
        value: aq ? (aq.pm25).toFixed(1) : '--',
        unit,
        ...this.getPollutantStatus(aq?.pm25 ?? 0, 15, 35),
      },
      {
        key: 'pm10',
        nameKey: 'airQuality.pm10',
        descKey: 'airQuality.pm10Desc',
        value: aq ? (aq.pm10).toFixed(1) : '--',
        unit,
        ...this.getPollutantStatus(aq?.pm10 ?? 0, 45, 80),
      },
      {
        key: 'o3',
        nameKey: 'airQuality.o3',
        descKey: 'airQuality.o3Desc',
        value: aq ? (aq.ozone).toFixed(1) : '--',
        unit,
        ...this.getPollutantStatus(aq?.ozone ?? 0, 100, 160),
      },
      {
        key: 'no2',
        nameKey: 'airQuality.no2',
        descKey: 'airQuality.no2Desc',
        value: aq ? (aq.nitrogenDioxide).toFixed(1) : '--',
        unit,
        ...this.getPollutantStatus(aq?.nitrogenDioxide ?? 0, 40, 90),
      },
      {
        key: 'so2',
        nameKey: 'airQuality.so2',
        descKey: 'airQuality.so2Desc',
        value: aq ? (aq.sulphurDioxide).toFixed(1) : '--',
        unit,
        ...this.getPollutantStatus(aq?.sulphurDioxide ?? 0, 40, 100),
      },
      {
        key: 'co',
        nameKey: 'airQuality.co',
        descKey: 'airQuality.coDesc',
        value: aq ? (aq.carbonMonoxide).toFixed(0) : '--',
        unit,
        ...this.getPollutantStatus(aq?.carbonMonoxide ?? 0, 4000, 9000),
      },
    ];
  }

  private getPollutantStatus(
    value: number,
    goodThreshold: number,
    moderateThreshold: number
  ): { badgeClass: string; badgeLabelKey: string } {
    if (value <= goodThreshold) {
      return {
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
        badgeLabelKey: 'airQuality.good',
      };
    }
    if (value <= moderateThreshold) {
      return {
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
        badgeLabelKey: 'airQuality.moderate',
      };
    }
    return {
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      badgeLabelKey: 'airQuality.unhealthy',
    };
  }
}
