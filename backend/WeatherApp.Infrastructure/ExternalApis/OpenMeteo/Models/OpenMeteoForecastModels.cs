using System.Text.Json.Serialization;

namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Models;

public sealed class OpenMeteoForecastResponse
{
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("timezone")]
    public string Timezone { get; set; } = string.Empty;

    [JsonPropertyName("current")]
    public CurrentWeatherBlock? Current { get; set; }

    [JsonPropertyName("hourly")]
    public HourlyWeatherBlock? Hourly { get; set; }

    [JsonPropertyName("daily")]
    public DailyWeatherBlock? Daily { get; set; }
}

public sealed class CurrentWeatherBlock
{
    [JsonPropertyName("time")]
    public string Time { get; set; } = string.Empty;

    [JsonPropertyName("temperature_2m")]
    public double Temperature2m { get; set; }

    [JsonPropertyName("relative_humidity_2m")]
    public int RelativeHumidity2m { get; set; }

    [JsonPropertyName("apparent_temperature")]
    public double ApparentTemperature { get; set; }

    [JsonPropertyName("weather_code")]
    public int WeatherCode { get; set; }

    [JsonPropertyName("surface_pressure")]
    public double SurfacePressure { get; set; }

    [JsonPropertyName("wind_speed_10m")]
    public double WindSpeed10m { get; set; }

    [JsonPropertyName("wind_direction_10m")]
    public int WindDirection10m { get; set; }

    [JsonPropertyName("is_day")]
    public int IsDay { get; set; }
}

public sealed class HourlyWeatherBlock
{
    [JsonPropertyName("time")]
    public List<string> Time { get; set; } = [];

    [JsonPropertyName("temperature_2m")]
    public List<double> Temperature2m { get; set; } = [];

    [JsonPropertyName("relative_humidity_2m")]
    public List<int> RelativeHumidity2m { get; set; } = [];

    [JsonPropertyName("apparent_temperature")]
    public List<double> ApparentTemperature { get; set; } = [];

    [JsonPropertyName("precipitation_probability")]
    public List<int> PrecipitationProbability { get; set; } = [];

    [JsonPropertyName("weather_code")]
    public List<int> WeatherCode { get; set; } = [];

    [JsonPropertyName("surface_pressure")]
    public List<double> SurfacePressure { get; set; } = [];

    [JsonPropertyName("wind_speed_10m")]
    public List<double> WindSpeed10m { get; set; } = [];

    [JsonPropertyName("wind_direction_10m")]
    public List<int> WindDirection10m { get; set; } = [];

    [JsonPropertyName("is_day")]
    public List<int> IsDay { get; set; } = [];
}

public sealed class DailyWeatherBlock
{
    [JsonPropertyName("time")]
    public List<string> Time { get; set; } = [];

    [JsonPropertyName("weather_code")]
    public List<int> WeatherCode { get; set; } = [];

    [JsonPropertyName("temperature_2m_max")]
    public List<double> Temperature2mMax { get; set; } = [];

    [JsonPropertyName("temperature_2m_min")]
    public List<double> Temperature2mMin { get; set; } = [];

    [JsonPropertyName("sunrise")]
    public List<string> Sunrise { get; set; } = [];

    [JsonPropertyName("sunset")]
    public List<string> Sunset { get; set; } = [];

    [JsonPropertyName("uv_index_max")]
    public List<double> UvIndexMax { get; set; } = [];
}

