import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { PwaService } from '../../services/pwa.service';

export type AppTab = 'weather' | 'cities' | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() activeTab: AppTab = 'weather';
  @Output() tabChange = new EventEmitter<AppTab>();

  settingsService = inject(SettingsService);
  pwaService = inject(PwaService);

  selectTab(tab: AppTab): void {
    this.tabChange.emit(tab);
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }
}

