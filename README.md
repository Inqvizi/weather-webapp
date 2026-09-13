# Weather Web App 🌤️

A modern, fast, and responsive weather dashboard built with **Angular 19** and **.NET 10**, powered by the free and open **Open-Meteo API** (Geocoding API for city search and Weather Forecast API for weather data).

![Architecture: Clean & Standalone](https://img.shields.io/badge/Architecture-Clean_&_Standalone-blue)
![Frontend: Angular 19](https://img.shields.io/badge/Frontend-Angular_19-dd0031?logo=angular)
![Backend: .NET 10](https://img.shields.io/badge/Backend-.NET_10-512bd4?logo=dotnet)
![Styling: TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?logo=tailwindcss)
![Weather Provider: Open--Meteo](https://img.shields.io/badge/Provider-Open--Meteo-22c55e)

## ✨ Features

- **Real-Time Weather:** Get accurate, up-to-date weather conditions for any city globally via Open-Meteo Forecast API.
- **City Search & Autocomplete:** Search cities with instant geocoding suggestions (`language=en`), returning city name, country/region, and geographical coordinates.
- **7-Day & 5-Day Daily Forecast:** Dynamically groups hourly data into daily cards, displaying exact min/max temperatures and condition-matching icons.
- **Interactive Hourly Forecast:** Click on any day in the forecast to filter the hourly timeline for that specific date.
- **WMO Weather Code Mapping:** Standard WMO weather codes (0–99) are mapped to English descriptions and day/night Bootstrap icons.
- **Dynamic & Reactive UI:** Built using Angular Signals for blazing fast updates.
- **Modern Aesthetics:** Styled with TailwindCSS, featuring smooth micro-animations, a clean dark-mode UI, and native Bootstrap Icons.
- **Clean Architecture Backend:** Strongly typed C# backend enforcing separation of concerns, caching decorator for high performance, and robust error handling.
- **No External API Keys Required:** Runs directly with Open-Meteo without the need for API keys.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Angular 19 (Standalone Components, Signals, Modern Control Flow `@if`, `@for`)
- **Styling:** TailwindCSS
- **Icons:** Bootstrap Icons

### Backend (Server)
- **Framework:** ASP.NET Core 10 (Web API)
- **Design Pattern:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Data Mapping:** AutoMapper
- **Validation:** FluentValidation
- **Caching:** In-Memory Cache (Decorator Pattern)
- **External Integration:** Open-Meteo API (Geocoding & Forecast)

---

## 🚀 Getting Started

### Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (v18 or higher)

---

### 1. Run Backend (.NET 10 Web API)

1. Open a terminal and navigate to the backend API directory:
   ```bash
   cd backend/WeatherApp.Api
   ```

2. Run the application:
   ```bash
   dotnet run
   ```
   The backend will start and listen on:
   - **HTTPS:** `https://localhost:7065`
   - **HTTP:** `http://localhost:5196`

   *(Open-Meteo requires no API keys; configuration works out-of-the-box).*

---

### 2. Run Frontend (Angular 19)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not installed yet):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to: **[http://localhost:4200/](http://localhost:4200/)**

---

## 🏗️ Architecture Highlights

- **Open-Meteo Geocoding + Forecast Integration:** Seamlessly resolves city queries to geographic coordinates and queries real-time hourly and current weather.
- **WMO Code Mapping:** Accurately maps weather condition codes to English descriptions and day/night icons.
- **In-Memory Caching:** Geocoding and weather responses are cached using the decorator pattern (`CachedWeatherApiClient`) to ensure minimal latency and avoid redundant network traffic.
- **Reactive UI with Angular Signals:** Components use signals for automatic, performant change detection.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.