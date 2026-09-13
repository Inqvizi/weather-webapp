import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  selectTab(tab: AppTab): void {
    this.tabChange.emit(tab);
  }
}
