import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RainViewerService, RainViewerApiResponse } from './rainviewer.service';

describe('RainViewerService', () => {
  const mockApiResponse: RainViewerApiResponse = {
    version: '2.0',
    generated: 1726309800,
    host: 'https://tilecache.rainviewer.com',
    radar: {
      past: [
        { time: 1726302000, path: '/v2/radar/1726302000' },
        { time: 1726305600, path: '/v2/radar/1726305600' },
      ],
      nowcast: [
        { time: 1726309200, path: '/v2/radar/1726309200' },
      ],
    },
    satellite: {
      infrared: [
        { time: 1726305600, path: '/v2/satellite/1726305600' },
      ],
    },
  };

  function createService(httpMock: any): RainViewerService {
    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: httpMock },
        { provide: RainViewerService, useClass: RainViewerService },
      ],
    });
    return runInInjectionContext(injector, () => injector.get(RainViewerService));
  }

  it('should fetch and parse radar frames correctly', async () => {
    const httpMock = {
      get: vi.fn().mockReturnValue(of(mockApiResponse)),
    };
    const service = createService(httpMock);

    const data = await new Promise((resolve) => {
      service.getRadarData().subscribe(resolve);
    });

    expect(data).toBeTruthy();
    const result = data as any;
    expect(result.host).toBe('https://tilecache.rainviewer.com');
    expect(result.frames.length).toBe(3);
    expect(result.frames[0].isNowcast).toBe(false);
    expect(result.frames[2].isNowcast).toBe(true);
    expect(result.satelliteFrames.length).toBe(1);
    expect(result.currentIndex).toBe(1); // latest past frame index
  });

  it('should generate valid radar tile URL', () => {
    const httpMock = { get: vi.fn() };
    const service = createService(httpMock);

    const url = service.getRadarTileUrl('https://tilecache.rainviewer.com', '/v2/radar/12345', 2, true, true, 256);
    expect(url).toBe('https://tilecache.rainviewer.com/v2/radar/12345/256/{z}/{x}/{y}/2/1_1.png');
  });

  it('should generate valid satellite tile URL', () => {
    const httpMock = { get: vi.fn() };
    const service = createService(httpMock);

    const url = service.getSatelliteTileUrl('https://tilecache.rainviewer.com', '/v2/satellite/12345', 256);
    expect(url).toBe('https://tilecache.rainviewer.com/v2/satellite/12345/256/{z}/{x}/{y}/0/0_0.png');
  });

  it('should handle API errors gracefully and return null', async () => {
    const httpMock = {
      get: vi.fn().mockReturnValue(throwError(() => new Error('Network error'))),
    };
    const service = createService(httpMock);

    const data = await new Promise((resolve) => {
      service.getRadarData().subscribe(resolve);
    });

    expect(data).toBeNull();
  });
});
