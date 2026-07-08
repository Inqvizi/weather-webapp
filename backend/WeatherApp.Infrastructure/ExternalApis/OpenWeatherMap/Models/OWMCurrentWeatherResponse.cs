using System.Text.Json.Serialization;

namespace WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Models;

internal sealed class OWMCurrentWeatherResponse
{
    [JsonPropertyName("name")]
    public string CityName { get; set; } = string.Empty;

    [JsonPropertyName("sys")]
    public OWMSys Sys { get; set; } = new();

    [JsonPropertyName("main")]
    public OWMMain Main { get; set; } = new();

    [JsonPropertyName("wind")]
    public OWMWind Wind { get; set; } = new();

    [JsonPropertyName("weather")]
    public List<OWMWeather> Weather { get; set; } = [];

    [JsonPropertyName("coord")]
    public OWMCoord Coord { get; set; } = new();

    [JsonPropertyName("dt")]
    public long Timestamp { get; set; }
}

internal sealed class OWMSys
{
    [JsonPropertyName("country")]
    public string Country { get; set; } = string.Empty;
}

internal sealed class OWMMain
{
    [JsonPropertyName("temp")]
    public double Temp { get; set; }

    [JsonPropertyName("feels_like")]
    public double FeelsLike { get; set; }

    [JsonPropertyName("humidity")]
    public int Humidity { get; set; }

    [JsonPropertyName("pressure")]
    public int Pressure { get; set; }
}

internal sealed class OWMWind
{
    [JsonPropertyName("speed")]
    public double Speed { get; set; }
}

internal sealed class OWMWeather
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("icon")]
    public string Icon { get; set; } = string.Empty;
}

internal sealed class OWMCoord
{
    [JsonPropertyName("lat")]
    public double Lat { get; set; }

    [JsonPropertyName("lon")]
    public double Lon { get; set; }
}