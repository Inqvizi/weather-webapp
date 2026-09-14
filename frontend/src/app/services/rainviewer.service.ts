import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, timeout } from 'rxjs';

export interface RainViewerFrame {
  time: number;
  path: string;
  isNowcast?: boolean;
}

export interface RainViewerApiResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: { time: number; path: string }[];
    nowcast: { time: number; path: string }[];
  };
  satellite?: {
    infrared: { time: number; path: string }[];
  };
}

export interface RainViewerData {
  host: string;
  frames: RainViewerFrame[];
  satelliteFrames: RainViewerFrame[];
  currentIndex: number;
}

export type RadarLayerType = 'radar' | 'satellite';

@Injectable({
  providedIn: 'root',
})
export class RainViewerService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.rainviewer.com/public/weather-maps.json';

  private cachedData$?: Observable<RainViewerData | null>;
  private lastFetchTime = 0;
  private readonly CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes

  getRadarData(forceRefresh = false): Observable<RainViewerData | null> {
    const now = Date.now();
    if (!this.cachedData$ || forceRefresh || now - this.lastFetchTime > this.CACHE_DURATION_MS) {
      this.lastFetchTime = now;
      this.cachedData$ = this.http.get<RainViewerApiResponse>(this.apiUrl).pipe(
        timeout(8000),
        map((res) => this.parseApiResponse(res)),
        catchError((err) => {
          console.error('Failed to load RainViewer radar data:', err);
          this.cachedData$ = undefined;
          return of(null);
        }),
        shareReplay(1)
      );
    }
    return this.cachedData$;
  }

  private parseApiResponse(res: RainViewerApiResponse): RainViewerData {
    const host = res.host || 'https://tilecache.rainviewer.com';

    const pastFrames: RainViewerFrame[] = (res.radar?.past ?? []).map((f) => ({
      time: f.time,
      path: f.path,
      isNowcast: false,
    }));

    const nowcastFrames: RainViewerFrame[] = (res.radar?.nowcast ?? []).map((f) => ({
      time: f.time,
      path: f.path,
      isNowcast: true,
    }));

    const frames: RainViewerFrame[] = [...pastFrames, ...nowcastFrames];

    const satelliteFrames: RainViewerFrame[] = (res.satellite?.infrared ?? []).map((f) => ({
      time: f.time,
      path: f.path,
      isNowcast: false,
    }));

    // Default to the latest 'past' frame (or last frame if none)
    const defaultIndex = Math.max(0, pastFrames.length - 1);

    return {
      host,
      frames,
      satelliteFrames,
      currentIndex: defaultIndex,
    };
  }

  getRadarTileUrl(
    host: string,
    path: string,
    colorScheme = 2,
    smooth = true,
    snow = true,
    tileSize = 256
  ): string {
    const smoothFlag = smooth ? 1 : 0;
    const snowFlag = snow ? 1 : 0;
    return `${host}${path}/${tileSize}/{z}/{x}/{y}/${colorScheme}/${smoothFlag}_${snowFlag}.png`;
  }

  getSatelliteTileUrl(host: string, path: string, tileSize = 256): string {
    return `${host}${path}/${tileSize}/{z}/{x}/{y}/0/0_0.png`;
  }
}
