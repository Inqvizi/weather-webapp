namespace WeatherApp.Application.DTOs;

public sealed class ForecastResponseDto
{
    public string CityName { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public IReadOnlyList<ForecastItemDto> Items { get; init; } = [];
    public IReadOnlyList<DailyForecastItemDto> Daily { get; init; } = [];
}