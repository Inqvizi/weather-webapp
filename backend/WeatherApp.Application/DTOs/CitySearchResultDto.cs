namespace WeatherApp.Application.DTOs;

public sealed class CitySearchResultDto
{
    public string Name { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public string AdminRegion { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}
