# Weather Web App 🌤️

A modern, fast, and fully responsive weather dashboard built with **Angular 19** and **.NET 10**, powered by the free and open **Open-Meteo API** (Geocoding API for city search, Weather Forecast API for weather conditions, and direct coordinate lookups).

![Architecture: Clean & Standalone](https://img.shields.io/badge/Architecture-Clean_&_Standalone-blue)
![Frontend: Angular 19](https://img.shields.io/badge/Frontend-Angular_19-dd0031?logo=angular)
![Backend: .NET 10](https://img.shields.io/badge/Backend-.NET_10-512bd4?logo=dotnet)
![Styling: TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?logo=tailwindcss)
![Weather Provider: Open--Meteo](https://img.shields.io/badge/Provider-Open--Meteo-22c55e)
![Theme: Dark_&_Light](https://img.shields.io/badge/Theme-Dark_&_Light-yellow)

---

## ✨ Key Features & Enhancements

- **Progressive Web App (PWA) & Offline Mode:**
  - Installable as a standalone native app on iOS, Android, and Desktop with one click.
  - Custom Web App Manifest (`manifest.webmanifest`) with crisp high-res 192x192, 512x512, and maskable icons.
  - Smart Service Worker (`sw.js`) with network-first caching for weather API data and app shell caching, allowing full offline browsing of the latest weather forecast.
  - Built-in install prompt button in navigation bar and dedicated iOS installation guide for Safari users.

- **Vector Meteocons SVG Icon System:**
  - Built with custom, scalable SVG weather graphics for all WMO weather codes (0–99).
  - Dynamic **day and night** variations (`is_day: 0 | 1`) ensuring nighttime clear skies show a crisp moon and daytime shows a radiant sun.
  - High-contrast, static vector presentation for optimal readability and zero visual clutter.

- **Interactive 7-Day & 24-Hour Timeline:**
  - Clicking any day in the 7-day forecast automatically updates the 24-hour timeline to display that date's 24-hour hourly conditions.
  - Includes an active day highlight and a one-click **"↺ Back to Today"** reset button.
  - Hourly cards consistently display **precipitation probability pills (`💧 X%`)** across all 24 hours, ensuring perfect structural symmetry, baseline alignment, and clear distinction between dry and rainy hours.

- **One-Click Geolocation & Search History:**
  - Crosshair location button in the search bar uses the browser's `navigator.geolocation` API to detect current coordinates and display local weather instantly.
  - Features intelligent reverse geocoding fallback for accurate local city names.
  - Stores recent searches (3–5 items) in `localStorage`, showing a quick dropdown menu on search bar focus with individual removal and "Clear all".

- **Detailed 6-Card Air Conditions Grid:**
  1. **Real Feel:** Apparent temperature converted to selected temperature unit.
  2. **Wind Velocity & Direction:** Live speed with rotating compass needle and 16-point cardinal direction badge (e.g. "NW", "ESE").
  3. **Humidity:** Relative humidity percentage.
  4. **Atmospheric Pressure:** Real barometric surface pressure (hPa or mmHg).
  5. **UV Index:** Max daily UV index with color-coded severity badges (*Low*, *Moderate*, *High*, *Very High*, *Extreme*).
  6. **Sun Schedule:** Precise daily Sunrise and Sunset times.

- **Light & Dark Theme Switching:**
  - One-click theme toggle directly in the sidebar navigation and inside Settings.
  - Sleek dark slate mode and clean, bright light mode with smooth transitions and persistent state in `localStorage`.

- **Favorite Cities Management:**
  - Dedicated "Cities" tab to save favorite locations, view live mini-cards with vector icons, add new cities, and remove them anytime.
  - Heart toggle directly on the main current weather display for instant bookmarking.

- **Customizable Measurement Settings:**
  - **Temperature:** Celsius (°C) / Fahrenheit (°F)
  - **Wind Speed:** km/h / m/s / mph
  - **Atmospheric Pressure:** hPa / mmHg
  - **Time Format:** 24-Hour (14:00) / 12-Hour (2:00 PM)
  - **Default City:** Set preferred default city on app launch

- **Zero API Keys Required:**
  - Powered completely by Open-Meteo and Open-Meteo Geocoding — runs out of the box with no API keys, accounts, or tokens required.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Angular 19 (Standalone Components, Signals, Modern Control Flow `@if`, `@for`)
- **Styling:** TailwindCSS + Vanilla CSS custom variables for Light/Dark themes and custom scrollbars
- **Icons:** Custom SVG Meteocons & Bootstrap Icons (`bootstrap-icons`)
- **State & Preferences:** Angular Signals & browser `localStorage`

### Backend (Server)
- **Framework:** ASP.NET Core 10 (Web API)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Object Mapping:** AutoMapper
- **Validation:** FluentValidation (City name and coordinate range validation)
- **Caching:** In-Memory Caching Decorator (`CachedWeatherApiClient`) for geocoding, city forecasts, and coordinate lookups
- **External Integration:** Open-Meteo API (Forecast, Daily, Hourly, Geocoding)

---

## 🚀 Getting Started

### Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (v18 or higher)

---

### 1. Run the Backend (.NET 10 API)

Open a terminal:
```bash
cd backend/WeatherApp.Api
dotnet run
```
The backend will launch and listen on:
- **HTTP:** `http://localhost:5196`
- **HTTPS:** `https://localhost:7065`
- **Swagger UI:** `http://localhost:5196/swagger` (in Development)

*No external API keys are required.*

---

### 2. Run the Frontend (Angular 19)

Open a second terminal:
```bash
cd frontend
npm install
npm start
```

Open your browser and navigate to:
👉 **[http://localhost:4200/](http://localhost:4200/)**

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/Weather/current/{city}` | Current weather condition for a city |
| `GET` | `/api/Weather/forecast/{city}` | 24-hour and 7-day daily forecast for a city |
| `GET` | `/api/Weather/by-coordinates?latitude={lat}&longitude={lon}` | Current weather by GPS coordinates |
| `GET` | `/api/Weather/by-coordinates/forecast?latitude={lat}&longitude={lon}` | Hourly & daily forecast by GPS coordinates |
| `GET` | `/api/Weather/search?query={prefix}` | Geocoding city search and autocomplete suggestions |

---

## 🏗️ Architecture & Clean Code Highlights

- **Clean Architecture:** Domain entities (`City`, `WeatherForecast`, `Temperature`, `Coordinates`) remain strictly isolated from external API schemas and HTTP concerns.
- **Resilient Caching Decorator:** Geocoding and weather responses are cached in-memory (`CachedWeatherApiClient`) for rapid responses and minimal network traffic.
- **Strict Typing:** Strong TypeScript interfaces and C# records/DTOs throughout all endpoints.
- **Safe Area & Fluid Layouts:** Responsive layout uses `min-w-0` to contain flex scrolling containers, preventing window overflow across mobile, tablet, and desktop viewports.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.