namespace WeatherApp.Application.DTOs;

public sealed class ForecastResponseDto
{
    public string CityName { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public IReadOnlyList<ForecastItemDto> Items { get; init; } = [];
}