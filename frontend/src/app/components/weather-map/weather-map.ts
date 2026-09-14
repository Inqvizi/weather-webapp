import {
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
  RadarLayerType,
  RainViewerFrame,
  RainViewerService,
} from '../../services/rainviewer.service';
import { WeatherResponseDto } from '../../services/weather.service';
import { TranslationService } from '../../services/translation.service';
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
  private platformId = inject(PLATFORM_ID);

  activeLayerType: RadarLayerType = 'radar';
  host = 'https://tilecache.rainviewer.com';

  radarFrames: RainViewerFrame[] = [];
  satelliteFrames: RainViewerFrame[] = [];
  currentFrameIndex = 0;

  isPlaying = false;
  isLoading = true;
  errorMessage: string | null = null;
  opacity = 0.75;
  animationSpeedMs = 700;
  isFullscreen = false;

  private map?: L.Map;
  private currentTileLayer?: L.TileLayer;
  private cityMarker?: L.Marker;
  private playTimer: any = null;

  // Track pre-cached tile layers by frame path
  private tileLayerCache = new Map<string, L.TileLayer>();

  get frames(): RainViewerFrame[] {
    return this.activeLayerType === 'radar' ? this.radarFrames : this.satelliteFrames;
  }

  get currentFrame(): RainViewerFrame | undefined {
    return this.frames[this.currentFrameIndex];
  }

  get isCurrentFrameNowcast(): boolean {
    return this.currentFrame?.isNowcast === true;
  }

  get isCurrentFrameLatestPast(): boolean {
    if (this.activeLayerType !== 'radar') return false;
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
      setTimeout(() => {
        this.initLeafletMap();
        this.loadRadarFrames();
      }, 50);
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

    // Premium Dark Base map (ArcGIS World Dark Gray Base - free, no watermark)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution:
          '&copy; Esri, HERE, Garmin &copy; <a href="https://www.rainviewer.com/">RainViewer</a>',
      }
    ).addTo(this.map);

    // Dark Reference labels & borders on top of base
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        zIndex: 500,
        opacity: 0.85,
      }
    ).addTo(this.map);

    this.updateCityMarker();
  }

  private updateCityMarker(): void {
    if (!this.map) return;

    const lat = this.currentWeather?.latitude ?? 50.4501;
    const lon = this.currentWeather?.longitude ?? 30.5234;
    const cityName = this.currentWeather?.cityName ?? 'Kyiv';
    const temp = this.currentWeather?.temperature != null ? `${Math.round(this.currentWeather.temperature)}°` : '';
    const desc = this.currentWeather?.description ?? '';

    if (this.cityMarker) {
      this.cityMarker.setLatLng([lat, lon]);
    } else {
      const markerHtml = `
        <div class="city-marker-container">
          <div class="city-marker-badge">
            <i class="bi bi-geo-alt-fill text-blue-400"></i>
            <span>${cityName} ${temp}</span>
          </div>
          <div class="city-marker-pin"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'city-weather-div-icon',
        html: markerHtml,
        iconSize: [120, 42],
        iconAnchor: [60, 42],
      });

      this.cityMarker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
    }

    // Popup content
    const popupContent = `
      <div class="p-3 text-left">
        <div class="font-bold text-sm text-white">${cityName}</div>
        <div class="text-xs text-blue-400 font-semibold mb-1">${temp} • ${desc}</div>
        <div class="text-[11px] text-gray-400">
          Вітер: ${this.currentWeather?.windSpeed ?? 0} км/год • Вологість: ${this.currentWeather?.humidity ?? 0}%
        </div>
      </div>
    `;
    this.cityMarker.bindPopup(popupContent);
  }

  loadRadarFrames(forceRefresh = false): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.rainViewerService.getRadarData(forceRefresh).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (!data || data.frames.length === 0) {
          this.errorMessage = 'Дані радара недоступні';
          return;
        }

        this.host = data.host;
        this.radarFrames = data.frames;
        this.satelliteFrames = data.satelliteFrames;
        this.currentFrameIndex = data.currentIndex;

        this.displayCurrentFrame();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Не вдалося завантажити радарні дані';
        console.error('Radar load error:', err);
      },
    });
  }

  private displayCurrentFrame(): void {
    if (!this.map || this.frames.length === 0) return;

    const frame = this.currentFrame;
    if (!frame) return;

    const tileUrl =
      this.activeLayerType === 'radar'
        ? this.rainViewerService.getRadarTileUrl(this.host, frame.path, 2, true, true, 256)
        : this.rainViewerService.getSatelliteTileUrl(this.host, frame.path, 256);

    let nextLayer = this.tileLayerCache.get(frame.path);
    if (!nextLayer) {
      nextLayer = L.tileLayer(tileUrl, {
        tileSize: 256,
        opacity: this.opacity,
        zIndex: 100,
      });
      this.tileLayerCache.set(frame.path, nextLayer);
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

  switchLayerType(type: RadarLayerType): void {
    if (this.activeLayerType === type) return;
    this.stopPlay();
    this.activeLayerType = type;
    this.currentFrameIndex = Math.max(0, this.frames.length - 1);
    this.displayCurrentFrame();
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
