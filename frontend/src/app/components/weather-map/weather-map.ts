import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import {
  RainViewerFrame,
  RainViewerService,
} from '../../services/rainviewer.service';
import { WeatherResponseDto } from '../../services/weather.service';
import { TranslationService } from '../../services/translation.service';
import { SettingsService, ThemeMode } from '../../services/settings.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-weather-map',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './weather-map.html',
  styleUrl: './weather-map.css',
})
export class WeatherMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() currentWeather?: WeatherResponseDto | null;
  @Input() favoriteCities: string[] = [];
  @Output() selectCity = new EventEmitter<string>();

  @ViewChild('mapContainer') mapContainerRef?: ElementRef<HTMLDivElement>;

  private rainViewerService = inject(RainViewerService);
  private translationService = inject(TranslationService);
  private settingsService = inject(SettingsService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  activeColorScheme: 2 | 6 = 2; // 2: Universal Blue, 6: NEXRAD
  host = 'https://tilecache.rainviewer.com';

  radarFrames: RainViewerFrame[] = [];
  currentFrameIndex = 0;

  isPlaying = false;
  isLoading = true;
  errorMessage: string | null = null;
  opacity = 0.75;
  animationSpeedMs = 700;
  isFullscreen = false;

  private map?: L.Map;
  private baseTileLayer?: L.TileLayer;
  private referenceTileLayer?: L.TileLayer;
  private currentTileLayer?: L.TileLayer;
  private cityMarker?: L.Marker;
  private playTimer: any = null;
  private themeObserver?: MutationObserver;

  // Track pre-cached tile layers by frame path and color scheme
  private tileLayerCache = new Map<string, L.TileLayer>();

  get frames(): RainViewerFrame[] {
    return this.radarFrames;
  }

  get currentFrame(): RainViewerFrame | undefined {
    return this.frames[this.currentFrameIndex];
  }

  get isCurrentFrameNowcast(): boolean {
    return this.currentFrame?.isNowcast === true;
  }

  get isCurrentFrameLatestPast(): boolean {
    const pastFrames = this.radarFrames.filter((f) => !f.isNowcast);
    if (pastFrames.length === 0) return false;
    const latestPastIndex = pastFrames.length - 1;
    return this.currentFrameIndex === latestPastIndex;
  }

  get currentFrameTimeFormatted(): string {
    if (!this.currentFrame) return '--:--';
    const date = new Date(this.currentFrame.time * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  get currentFrameRelativeLabel(): string {
    if (!this.currentFrame) return '';
    const nowSeconds = Math.floor(Date.now() / 1000);
    const diffMinutes = Math.round((this.currentFrame.time - nowSeconds) / 60);

    if (Math.abs(diffMinutes) <= 5) {
      return this.translationService.t('map.live');
    }
    if (diffMinutes > 0) {
      return `+${diffMinutes} хв`;
    }
    return `${diffMinutes} хв`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initLeafletMap();
      this.loadRadarFrames();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentWeather'] && this.map) {
      this.updateCityMarker();
      if (!changes['currentWeather'].firstChange) {
        this.recenterMap();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPlay();
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = undefined;
    }
    this.cleanupMap();
  }

  private initLeafletMap(): void {
    const mapElement = document.getElementById('weather-leaflet-map');
    if (!mapElement || this.map) return;

    // Default center: coordinates from currentWeather or Kyiv [50.4501, 30.5234]
    const lat = this.currentWeather?.latitude ?? 50.4501;
    const lon = this.currentWeather?.longitude ?? 30.5234;

    this.map = L.map('weather-leaflet-map', {
      center: [lat, lon],
      zoom: 6,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Apply base map according to current theme (Dark vs Light)
    const isLightInitial =
      (typeof document !== 'undefined' && document.documentElement.classList.contains('light')) ||
      this.settingsService.settings().theme === 'light';
    this.updateBaseMapTheme(isLightInitial ? 'light' : 'dark');

    // Dynamically observe theme class changes on <html>
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      this.themeObserver = new MutationObserver(() => {
        const isLight = document.documentElement.classList.contains('light');
        this.updateBaseMapTheme(isLight ? 'light' : 'dark');
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    this.updateCityMarker();
    setTimeout(() => this.map?.invalidateSize(), 150);
  }

  private updateBaseMapTheme(theme: ThemeMode): void {
    if (!this.map) return;

    if (this.baseTileLayer && this.map.hasLayer(this.baseTileLayer)) {
      this.map.removeLayer(this.baseTileLayer);
    }
    if (this.referenceTileLayer && this.map.hasLayer(this.referenceTileLayer)) {
      this.map.removeLayer(this.referenceTileLayer);
    }

    const isLight = theme === 'light';
    const baseService = isLight ? 'World_Light_Gray_Base' : 'World_Dark_Gray_Base';
    const refService = isLight ? 'World_Light_Gray_Reference' : 'World_Dark_Gray_Reference';

    this.baseTileLayer = L.tileLayer(
      `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${baseService}/MapServer/tile/{z}/{y}/{x}`,
      {
        maxZoom: 16,
        zIndex: 1,
        attribution:
          '&copy; Esri, HERE, Garmin &copy; <a href="https://www.rainviewer.com/">RainViewer</a>',
      }
    ).addTo(this.map);

    this.referenceTileLayer = L.tileLayer(
      `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${refService}/MapServer/tile/{z}/{y}/{x}`,
      {
        maxZoom: 16,
        zIndex: 500,
        opacity: isLight ? 0.9 : 0.85,
      }
    ).addTo(this.map);
  }

  private updateCityMarker(): void {
    if (!this.map) return;

    const lat = this.currentWeather?.latitude ?? 50.4501;
    const lon = this.currentWeather?.longitude ?? 30.5234;
    const cityName = this.currentWeather?.cityName ?? 'Kyiv';
    const temp = this.currentWeather?.temperature != null ? `${Math.round(this.currentWeather.temperature)}°` : '';
    const desc = this.currentWeather?.description ?? '';

    const markerHtml = `
      <div class="city-marker-container">
        <div class="city-beacon-ring"></div>
        <div class="city-beacon-dot"></div>
        <div class="city-pin-tooltip">
          <div class="city-pin-content">
            <i class="bi bi-geo-alt-fill city-pin-icon"></i>
            <span class="city-pin-name">${cityName}</span>
            ${temp ? `<span class="city-pin-temp">${temp}</span>` : ''}
          </div>
          <div class="city-pin-arrow"></div>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'city-weather-leaflet-icon',
      html: markerHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (this.cityMarker) {
      this.cityMarker.setLatLng([lat, lon]);
      this.cityMarker.setIcon(customIcon);
    } else {
      this.cityMarker = L.marker([lat, lon], {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(this.map);
    }

    // Popup content
    const popupContent = `
      <div class="p-3 text-left">
        <div class="font-bold text-sm text-white popup-city-name">${cityName}</div>
        <div class="text-xs text-blue-400 font-semibold mb-1 popup-city-sub">${temp} • ${desc}</div>
        <div class="text-[11px] text-gray-400 popup-city-info">
          Вітер: ${this.currentWeather?.windSpeed ?? 0} км/год • Вологість: ${this.currentWeather?.humidity ?? 0}%
        </div>
      </div>
    `;
    this.cityMarker.bindPopup(popupContent);
  }

  loadRadarFrames(forceRefresh = false): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.rainViewerService.getRadarData(forceRefresh).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (!data || data.frames.length === 0) {
          this.errorMessage = 'Дані радара недоступні';
          this.cdr.markForCheck();
          return;
        }

        this.host = data.host;
        this.radarFrames = data.frames;
        this.currentFrameIndex = data.currentIndex;

        this.displayCurrentFrame();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Не вдалося завантажити радарні дані';
        this.cdr.markForCheck();
        console.error('Radar load error:', err);
      },
    });
  }

  private displayCurrentFrame(): void {
    if (!this.map || this.frames.length === 0) return;

    const frame = this.currentFrame;
    if (!frame) return;

    const cacheKey = `${frame.path}_scheme${this.activeColorScheme}`;
    const tileUrl = this.rainViewerService.getRadarTileUrl(
      this.host,
      frame.path,
      this.activeColorScheme,
      true,
      true,
      256
    );

    let nextLayer = this.tileLayerCache.get(cacheKey);
    if (!nextLayer) {
      nextLayer = L.tileLayer(tileUrl, {
        tileSize: 256,
        opacity: this.opacity,
        zIndex: 200,
        maxNativeZoom: 7,
        maxZoom: 18,
      });
      this.tileLayerCache.set(cacheKey, nextLayer);
    }

    if (this.currentTileLayer && this.currentTileLayer !== nextLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    nextLayer.setOpacity(this.opacity);
    if (!this.map.hasLayer(nextLayer)) {
      nextLayer.addTo(this.map);
    }
    this.currentTileLayer = nextLayer;
  }

  switchColorScheme(scheme: 2 | 6): void {
    if (this.activeColorScheme === scheme) return;
    this.activeColorScheme = scheme;
    if (this.currentTileLayer && this.map) {
      this.map.removeLayer(this.currentTileLayer);
      this.currentTileLayer = undefined;
    }
    this.displayCurrentFrame();
    this.cdr.markForCheck();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.stopPlay();
    } else {
      this.startPlay();
    }
  }

  private startPlay(): void {
    if (this.frames.length <= 1) return;
    this.isPlaying = true;
    this.scheduleNextFrame();
  }

  private scheduleNextFrame(): void {
    if (!this.isPlaying) return;

    this.playTimer = setTimeout(() => {
      this.stepForward();

      // If at the end of frames, pause for 1.2s at current live/forecast frame before restarting loop
      const delay =
        this.currentFrameIndex === this.frames.length - 1
          ? this.animationSpeedMs * 1.8
          : this.animationSpeedMs;

      if (this.isPlaying) {
        this.playTimer = setTimeout(() => {
          this.scheduleNextFrame();
        }, delay - this.animationSpeedMs);
      }
    }, this.animationSpeedMs);
  }

  stopPlay(): void {
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
  }

  stepForward(): void {
    if (this.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    this.displayCurrentFrame();
  }

  stepBackward(): void {
    if (this.frames.length === 0) return;
    this.currentFrameIndex =
      this.currentFrameIndex === 0 ? this.frames.length - 1 : this.currentFrameIndex - 1;
    this.displayCurrentFrame();
  }

  onScrubberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newIndex = parseInt(target.value, 10);
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < this.frames.length) {
      this.currentFrameIndex = newIndex;
      this.displayCurrentFrame();
    }
  }

  onOpacityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newOpacity = parseFloat(target.value);
    if (!isNaN(newOpacity)) {
      this.opacity = newOpacity;
      if (this.currentTileLayer) {
        this.currentTileLayer.setOpacity(this.opacity);
      }
    }
  }

  setSpeed(speedMs: number): void {
    this.animationSpeedMs = speedMs;
    if (this.isPlaying) {
      this.stopPlay();
      this.startPlay();
    }
  }

  recenterMap(): void {
    if (!this.map) return;
    const lat = this.currentWeather?.latitude ?? 50.4501;
    const lon = this.currentWeather?.longitude ?? 30.5234;
    this.map.flyTo([lat, lon], 7, { duration: 1.2 });
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private cleanupMap(): void {
    if (this.map) {
      if (this.baseTileLayer && this.map.hasLayer(this.baseTileLayer)) {
        this.map.removeLayer(this.baseTileLayer);
      }
      if (this.referenceTileLayer && this.map.hasLayer(this.referenceTileLayer)) {
        this.map.removeLayer(this.referenceTileLayer);
      }
      this.tileLayerCache.forEach((layer) => {
        if (this.map?.hasLayer(layer)) {
          this.map.removeLayer(layer);
        }
      });
      this.tileLayerCache.clear();
      this.map.remove();
      this.map = undefined;
    }
  }
}
