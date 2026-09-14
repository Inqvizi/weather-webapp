// @vitest-environment jsdom
import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { WeatherMapComponent } from './weather-map';
import { RainViewerService, RainViewerData } from '../../services/rainviewer.service';
import { TranslationService } from '../../services/translation.service';
import { SettingsService } from '../../services/settings.service';

describe('WeatherMapComponent Class Logic', () => {
  let mockRainViewerService: any;

  const sampleData: RainViewerData = {
    host: 'https://tilecache.rainviewer.com',
    frames: [
      { time: 1726300000, path: '/v2/radar/1', isNowcast: false },
      { time: 1726303600, path: '/v2/radar/2', isNowcast: false },
      { time: 1726307200, path: '/v2/radar/3', isNowcast: true },
    ],
    satelliteFrames: [
      { time: 1726303600, path: '/v2/satellite/1', isNowcast: false },
    ],
    currentIndex: 1,
  };

  beforeEach(() => {
    mockRainViewerService = {
      getRadarData: vi.fn().mockReturnValue(of(sampleData)),
      getRadarTileUrl: vi.fn().mockReturnValue('https://example.com/tile.png'),
      getSatelliteTileUrl: vi.fn().mockReturnValue('https://example.com/sat.png'),
    };
  });

  function createComponent(): WeatherMapComponent {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: RainViewerService, useValue: mockRainViewerService },
        { provide: SettingsService, useClass: SettingsService },
        { provide: TranslationService, useClass: TranslationService },
      ],
    });

    return runInInjectionContext(injector, () => new WeatherMapComponent());
  }

  it('should initialize and load radar data properly', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    expect(comp.isLoading).toBe(false);
    expect(comp.frames.length).toBe(3);
    expect(comp.currentFrameIndex).toBe(1);
    expect(comp.currentFrame?.path).toBe('/v2/radar/2');
  });

  it('should identify latest past frame and nowcast frame correctly', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    // Index 1 is latest past frame
    comp.currentFrameIndex = 1;
    expect(comp.isCurrentFrameLatestPast).toBe(true);
    expect(comp.isCurrentFrameNowcast).toBe(false);

    // Index 2 is nowcast
    comp.currentFrameIndex = 2;
    expect(comp.isCurrentFrameNowcast).toBe(true);
    expect(comp.isCurrentFrameLatestPast).toBe(false);
  });

  it('should step forward and loop at end of frames', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    comp.currentFrameIndex = 1;
    comp.stepForward();
    expect(comp.currentFrameIndex).toBe(2);

    // Loop back to 0
    comp.stepForward();
    expect(comp.currentFrameIndex).toBe(0);
  });

  it('should step backward and loop to end when at 0', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    comp.currentFrameIndex = 0;
    comp.stepBackward();
    expect(comp.currentFrameIndex).toBe(2);
  });

  it('should switch layer type between radar and satellite', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    expect(comp.activeLayerType).toBe('radar');
    expect(comp.frames.length).toBe(3);

    comp.switchLayerType('satellite');
    expect(comp.activeLayerType).toBe('satellite');
    expect(comp.frames.length).toBe(1);
  });

  it('should toggle play and stop animation properly', () => {
    const comp = createComponent();
    comp.loadRadarFrames();

    expect(comp.isPlaying).toBe(false);
    comp.togglePlay();
    expect(comp.isPlaying).toBe(true);

    comp.togglePlay();
    expect(comp.isPlaying).toBe(false);
  });

  it('should toggle fullscreen state', () => {
    const comp = createComponent();
    expect(comp.isFullscreen).toBe(false);

    comp.toggleFullscreen();
    expect(comp.isFullscreen).toBe(true);

    comp.toggleFullscreen();
    expect(comp.isFullscreen).toBe(false);
  });
});
