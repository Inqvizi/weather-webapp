using WeatherApp.Application.DTOs;

namespace WeatherApp.Application.Interfaces;

public interface IWeatherService
{
    Task<WeatherResponseDto> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default);

    Task<WeatherResponseDto> GetCurrentWeatherByCoordinatesAsync(double latitude, double longitude, string? cityName = null, CancellationToken cancellationToken = default);

    Task<ForecastResponseDto> GetForecastAsync(string cityName, CancellationToken cancellationToken = default);

    Task<ForecastResponseDto> GetForecastByCoordinatesAsync(double latitude, double longitude, string? cityName = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CitySearchResultDto>> SearchCitiesAsync(string query, string? language = null, CancellationToken cancellationToken = default);
    Task<AirQualityDto?> GetAirQualityAsync(string cityName, CancellationToken cancellationToken = default);
    Task<AirQualityDto?> GetAirQualityByCoordinatesAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}