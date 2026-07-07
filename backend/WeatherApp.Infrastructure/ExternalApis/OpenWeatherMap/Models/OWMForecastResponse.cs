using System.Text.Json.Serialization;

namespace WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Models;

internal sealed class OWMForecastResponse
{
    [JsonPropertyName("city")]
    public OWMForecastCity City { get; set; } = new();

    [JsonPropertyName("list")]
    public List<OWMForecastItem> List { get; set; } = [];
}

internal sealed class OWMForecastCity
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("country")]
    public string Country { get; set; } = string.Empty;
}

internal sealed class OWMForecastItem
{
    [JsonPropertyName("dt")]
    public long Timestamp { get; set; }

    [JsonPropertyName("main")]
    public OWMMain Main { get; set; } = new();

    [JsonPropertyName("wind")]
    public OWMWind Wind { get; set; } = new();

    [JsonPropertyName("weather")]
    public List<OWMWeather> Weather { get; set; } = [];
}