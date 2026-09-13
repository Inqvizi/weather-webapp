import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'weatherapp_favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  readonly favorites = signal<string[]>(this.loadFavorites());

  private loadFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If stored favorites are the old initial hardcoded test list, reset to clean state
          const oldDefault = ['Lviv', 'Kyiv', 'London', 'New York', 'Tokyo'];
          const isOldDefault =
            parsed.length === oldDefault.length &&
            parsed.every((val, index) => val.toLowerCase() === oldDefault[index].toLowerCase());

          if (isOldDefault) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            return [];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveFavorites(list: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
    this.favorites.set(list);
  }

  isFavorite(city: string): boolean {
    if (!city) return false;
    const lower = city.trim().toLowerCase();
    return this.favorites().some(f => f.toLowerCase() === lower);
  }

  addFavorite(city: string): void {
    const trimmed = city.trim();
    if (!trimmed || this.isFavorite(trimmed)) return;
    const updated = [...this.favorites(), trimmed];
    this.saveFavorites(updated);
  }

  removeFavorite(city: string): void {
    const lower = city.trim().toLowerCase();
    const updated = this.favorites().filter(f => f.toLowerCase() !== lower);
    this.saveFavorites(updated);
  }

  toggleFavorite(city: string): boolean {
    if (this.isFavorite(city)) {
      this.removeFavorite(city);
      return false;
    } else {
      this.addFavorite(city);
      return true;
    }
  }
}
