using WeatherApp.Application.DTOs;

namespace WeatherApp.Application.Interfaces;

public interface IWeatherApiClient
{
    Task<WeatherResponseDto> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ForecastItemDto>> GetForecastAsync(string cityName, CancellationToken cancellationToken = default);
}