import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;

  isInstallable = signal<boolean>(false);
  isInstalled = signal<boolean>(false);
  isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  isIOS = signal<boolean>(false);
  showIosInstallGuide = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.initNetworkListeners();
      this.initInstallPrompt();
      this.registerServiceWorker();
      this.detectPlatform();
    }
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  private initNetworkListeners() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  private initInstallPrompt() {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true) {
      this.isInstalled.set(true);
      return;
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent default mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.isInstallable.set(false);
      this.deferredPrompt = null;
      console.log('[PWA] WeatherApp was successfully installed!');
    });
  }

  private detectPlatform() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    this.isIOS.set(isIosDevice);
    if (isIosDevice && !isStandalone) {
      // On iOS Safari, beforeinstallprompt is not supported, so we show the iOS helper button
      this.isInstallable.set(true);
    }
  }

  async promptInstall(): Promise<boolean> {
    if (this.isIOS()) {
      this.showIosInstallGuide.set(!this.showIosInstallGuide());
      return false;
    }

    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.isInstallable.set(false);
    return outcome === 'accepted';
  }

  closeIosGuide() {
    this.showIosInstallGuide.set(false);
  }
}
