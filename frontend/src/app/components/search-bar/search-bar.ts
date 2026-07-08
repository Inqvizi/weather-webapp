import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  @Output() search = new EventEmitter<string>();

  onSearch(event: any) {
    if (event.key === 'Enter') {
      const city = event.target.value.trim();
      if (city) {
        this.search.emit(city);
        event.target.value = '';
      }
    }
  }
}
