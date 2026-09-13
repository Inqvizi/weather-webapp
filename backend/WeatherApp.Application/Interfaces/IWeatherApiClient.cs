using WeatherApp.Domain.Entities;

namespace WeatherApp.Application.Interfaces;

public interface IWeatherApiClient
{
    Task<WeatherForecast> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WeatherForecast>> GetForecastAsync(string cityName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<City>> SearchCitiesAsync(string query, string? language = null, CancellationToken cancellationToken = default);
}