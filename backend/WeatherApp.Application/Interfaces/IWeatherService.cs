using WeatherApp.Application.DTOs;

namespace WeatherApp.Application.Interfaces;

public interface IWeatherService
{
    Task<WeatherResponseDto> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default);

    Task<ForecastResponseDto> GetForecastAsync(string cityName, CancellationToken cancellationToken = default);
}