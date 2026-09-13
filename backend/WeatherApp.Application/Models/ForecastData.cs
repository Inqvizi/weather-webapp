using WeatherApp.Application.DTOs;
using WeatherApp.Domain.Entities;

namespace WeatherApp.Application.Models;

public sealed record ForecastData(
    City City,
    IReadOnlyList<WeatherForecast> Hourly,
    IReadOnlyList<DailyForecastItemDto> Daily);
