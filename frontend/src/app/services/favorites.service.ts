import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'weatherapp_favorites';
const DEFAULT_FAVORITES: string[] = ['Lviv', 'Kyiv', 'London', 'New York', 'Tokyo'];

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  readonly favorites = signal<string[]>(this.loadFavorites());

  private loadFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_FAVORITES];
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
