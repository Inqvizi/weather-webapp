using WeatherApp.Application.Models;
using WeatherApp.Domain.Entities;

namespace WeatherApp.Application.Interfaces;

public interface IWeatherApiClient
{
    Task<WeatherForecast> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default);
    Task<WeatherForecast> GetCurrentWeatherByCoordinatesAsync(double latitude, double longitude, string? cityName = null, CancellationToken cancellationToken = default);
    Task<ForecastData> GetForecastAsync(string cityName, CancellationToken cancellationToken = default);
    Task<ForecastData> GetForecastByCoordinatesAsync(double latitude, double longitude, string? cityName = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<City>> SearchCitiesAsync(string query, string? language = null, CancellationToken cancellationToken = default);
}