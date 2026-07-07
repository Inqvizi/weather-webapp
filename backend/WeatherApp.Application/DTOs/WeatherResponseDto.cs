namespace WeatherApp.Application.DTOs;

public sealed class WeatherResponseDto
{
    public string CityName { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public double Temperature { get; init; }
    public double FeelsLike { get; init; }
    public int Humidity { get; init; }
    public double WindSpeed { get; init; }
    public string Description { get; init; } = string.Empty;
    public string IconCode { get; init; } = string.Empty;
    public DateTime MeasuredAt { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}