# Weather Web App 🌤️

A modern, fast, and fully responsive weather dashboard built with **Angular 19** and **.NET 10**, powered by the free and open **Open-Meteo API** (Geocoding API for city search and Weather Forecast API for weather conditions).

![Architecture: Clean & Standalone](https://img.shields.io/badge/Architecture-Clean_&_Standalone-blue)
![Frontend: Angular 19](https://img.shields.io/badge/Frontend-Angular_19-dd0031?logo=angular)
![Backend: .NET 10](https://img.shields.io/badge/Backend-.NET_10-512bd4?logo=dotnet)
![Styling: TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?logo=tailwindcss)
![Weather Provider: Open--Meteo](https://img.shields.io/badge/Provider-Open--Meteo-22c55e)

---

## ✨ Key Features

- **Real-Time Weather:** Get accurate, up-to-date weather conditions for any city globally via Open-Meteo Forecast API.
- **City Search & Autocomplete:** Real-time city search powered by Open-Meteo Geocoding API (`language=en`), with instant suggestions, country badges, and admin regions.
- **Dynamic 24-Hour Forecast:** Shows the upcoming 24 consecutive hours starting from the current hour ("Now"), with smoothly changing temperatures, condition icons, and an interactive horizontal scrollbar with navigation arrows.
- **7-Day Daily Forecast:** Dynamically groups daily forecasts into clean cards with min/max temperatures. Clicking on any day filters the 24-hour timeline for that specific date.
- **Favorite Cities Management:** Dedicated "Cities" tab to save favorite locations, view live mini-weather cards, add new cities, and quickly switch forecasts. Also includes a quick-favorite heart button on the main weather card.
- **Customizable Settings:** Dedicated "Settings" tab with reactive unit conversions:
  - **Temperature:** Celsius (°C) / Fahrenheit (°F)
  - **Wind Speed:** km/h / m/s / mph
  - **Atmospheric Pressure:** hPa / mmHg
  - **Time Format:** 24-Hour (14:00) / 12-Hour (2:00 PM)
  - **Default City:** Set preferred default city on app startup
- **Air Conditions Grid:** Real Feel, Wind, Humidity, and Pressure with unit conversion.
- **WMO Weather Code Mapping:** Standard WMO weather codes (0–99) accurately mapped to descriptions and day/night Bootstrap icons.
- **Fully Responsive Design:** Optimized for mobile phones (bottom navigation, touch-scrolling), tablets (adaptive grid), and desktop monitors.
- **Zero API Keys Required:** Runs out of the box using Open-Meteo without the need for API keys or secrets.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Angular 19 (Standalone Components, Signals, Modern Control Flow `@if`, `@for`)
- **Styling:** TailwindCSS with custom scrollbars and dark-theme palette
- **Icons:** Bootstrap Icons (`bootstrap-icons`)
- **State & Preferences:** Angular Signals & browser `localStorage`

### Backend (Server)
- **Framework:** ASP.NET Core 10 (Web API)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Object Mapping:** AutoMapper
- **Validation:** FluentValidation (Unicode letters, hyphens, and apostrophes)
- **Caching:** In-Memory Caching with Decorator Pattern (`CachedWeatherApiClient`)
- **External Integration:** Open-Meteo API (Geocoding & Forecast)

---

## 🚀 Getting Started

### Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (v18 or higher)

---

### 1. Run the Backend (.NET 10 API)

Open a terminal and run:
```bash
cd backend/WeatherApp.Api
dotnet run
```
The backend will launch and listen on:
- **HTTP:** `http://localhost:5196`
- **HTTPS:** `https://localhost:7065`

*No external API keys are required.*

---

### 2. Run the Frontend (Angular 19)

Open a second terminal and run:
```bash
cd frontend
npm install
npm start
```

Open your browser and navigate to:
👉 **[http://localhost:4200/](http://localhost:4200/)**

---

## 🏗️ Architecture & Clean Code Highlights

- **Separation of Concerns:** Core domain entities (`City`, `WeatherForecast`, `Temperature`, `Coordinates`) remain strictly isolated from external API schemas and HTTP concerns.
- **Resilient Caching Decorator:** Geocoding and weather responses are cached in-memory (`CachedWeatherApiClient`) for rapid responses and minimal network traffic.
- **Strict Typing:** Strong TypeScript interfaces and C# records/DTOs throughout all endpoints.
- **Safe Area & Fluid Layouts:** Responsive layout uses `min-w-0` to contain flex scrolling containers, preventing window overflow across mobile, tablet, and desktop viewports.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.