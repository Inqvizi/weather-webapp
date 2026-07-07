namespace WeatherApp.Application.DTOs;

public sealed class ForecastItemDto
{
    public DateTime DateTime { get; init; }
    public double Temperature { get; init; }
    public double FeelsLike { get; init; }
    public int Humidity { get; init; }
    public double WindSpeed { get; init; }
    public string Description { get; init; } = string.Empty;
    public string IconCode { get; init; } = string.Empty;
}