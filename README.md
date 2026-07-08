# Weather Web App 🌤️

A modern, fast, and responsive weather dashboard built with **Angular 19** and **.NET 10**. 

This application provides real-time weather data, hourly forecasts, and a 5-day forecast grouped dynamically from the OpenWeatherMap API.

![Architecture: Clean & Standalone](https://img.shields.io/badge/Architecture-Clean_&_Standalone-blue)
![Frontend: Angular 19](https://img.shields.io/badge/Frontend-Angular_19-dd0031?logo=angular)
![Backend: .NET 10](https://img.shields.io/badge/Backend-.NET_10-512bd4?logo=dotnet)
![Styling: TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?logo=tailwindcss)

## ✨ Features

- **Real-Time Weather:** Get accurate, up-to-date weather conditions for any city globally.
- **5-Day Daily Forecast:** Intelligently groups 3-hour interval data into clean daily cards, calculating exact min/max temperatures per day and capturing day-specific icons.
- **Interactive Hourly Forecast:** Click on any day in the 5-day forecast to instantly filter the hourly timeline for that specific date.
- **Dynamic & Reactive UI:** Built using Angular Signals for blazing fast updates and zero RxJS subscription boilerplate.
- **Modern Aesthetics:** Styled with TailwindCSS, featuring smooth micro-animations, a clean dark-mode UI, and native Bootstrap Icons matching time of day and rain intensity.
- **Clean Architecture Backend:** Strongly typed C# backend enforcing separation of concerns, mapping external API payloads into clean Domain and Application DTOs.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Angular 19 (Standalone Components, Signals, New Control Flow `@if`, `@for`)
- **Styling:** TailwindCSS
- **Icons:** Bootstrap Icons

### Backend (Server)
- **Framework:** ASP.NET Core 10 (Web API)
- **Design Pattern:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Data Mapping:** AutoMapper
- **External Integration:** OpenWeatherMap API

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.io/cli)
- [.NET SDK 10](https://dotnet.microsoft.com/)
- An API Key from [OpenWeatherMap](https://openweathermap.org/api)

### 1. Backend Setup

Navigate to the backend API directory:
```bash
cd backend/WeatherApp.Api
```

Configure your OpenWeatherMap API Key in `appsettings.Development.json` (or via user secrets):
```json
{
  "OpenWeatherMap": {
    "ApiKey": "YOUR_API_KEY_HERE"
  }
}
```

Run the API:
```bash
dotnet run
```
The backend will typically start on `https://localhost:7065`.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Angular development server:
```bash
npm start
```

Open your browser and navigate to `http://localhost:4200/`.

---

## 🏗️ Architecture Highlights

- **No `app.module.ts`:** The frontend uses pure Standalone Components. Each component explicitly imports only what it needs.
- **State Management:** Handled entirely by Angular `signal()` and `forkJoin` for parallel API requests, avoiding complex state libraries.
- **Smart Icon Mapping:** The backend threads the `IconCode` to the frontend, where a pure TS utility (`icon.mapper.ts`) intelligently falls back to specific vectors depending on day/night variations and rain intensity. 

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.