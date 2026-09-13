namespace WeatherApp.Application.DTOs;

public sealed class DailyForecastItemDto
{
    public string Date { get; init; } = string.Empty;
    public int WeatherCode { get; init; }
    public string Description { get; init; } = string.Empty;
    public string IconCode { get; init; } = string.Empty;
    public double MinTemp { get; init; }
    public double MaxTemp { get; init; }
    public string Sunrise { get; init; } = string.Empty;
    public string Sunset { get; init; } = string.Empty;
    public double UvIndexMax { get; init; }
}
