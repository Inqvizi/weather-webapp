import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TemperatureUnit, WindSpeedUnit, PressureUnit, TimeFormat, ThemeMode, AppLanguage } from '../../services/settings.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent {
  settingsService = inject(SettingsService);

  defaultCityInput = this.settingsService.settings().defaultCity;
  saveSuccess = false;

  setLanguage(lang: AppLanguage): void {
    this.settingsService.setLanguage(lang);
  }

  setTheme(theme: ThemeMode): void {
    this.settingsService.setTheme(theme);
  }

  setTemp(unit: TemperatureUnit): void {
    this.settingsService.setTemperatureUnit(unit);
  }

  setWind(unit: WindSpeedUnit): void {
    this.settingsService.setWindSpeedUnit(unit);
  }

  setPressure(unit: PressureUnit): void {
    this.settingsService.setPressureUnit(unit);
  }

  setTime(format: TimeFormat): void {
    this.settingsService.setTimeFormat(format);
  }


  saveDefaultCity(): void {
    if (this.defaultCityInput.trim()) {
      this.settingsService.setDefaultCity(this.defaultCityInput.trim());
      this.saveSuccess = true;
      setTimeout(() => (this.saveSuccess = false), 2500);
    }
  }

  reset(): void {
    this.settingsService.resetToDefaults();
    this.defaultCityInput = this.settingsService.settings().defaultCity;
    this.saveSuccess = true;
    setTimeout(() => (this.saveSuccess = false), 2500);
  }
}
