using WeatherApp.Application.DTOs;
using WeatherApp.Domain.Entities;
using WeatherApp.Domain.ValueObjects;

namespace WeatherApp.Application.Models;

public sealed record ForecastData(
    City City,
    IReadOnlyList<WeatherForecast> Hourly,
    IReadOnlyList<DailyForecastItemDto> Daily,
    AirQuality? AirQuality = null);
