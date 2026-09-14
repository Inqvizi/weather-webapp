using System.Text.Json.Serialization;

namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Models;

public sealed class OpenMeteoAirQualityResponse
{
    [JsonPropertyName("latitude")]
    public double Latitude { get; init; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; init; }

    [JsonPropertyName("current")]
    public AirQualityCurrentBlock? Current { get; init; }
}

public sealed class AirQualityCurrentBlock
{
    [JsonPropertyName("time")]
    public string Time { get; init; } = string.Empty;

    [JsonPropertyName("european_aqi")]
    public int? EuropeanAqi { get; init; }

    [JsonPropertyName("us_aqi")]
    public int? UsAqi { get; init; }

    [JsonPropertyName("pm10")]
    public double? Pm10 { get; init; }

    [JsonPropertyName("pm2_5")]
    public double? Pm25 { get; init; }

    [JsonPropertyName("carbon_monoxide")]
    public double? CarbonMonoxide { get; init; }

    [JsonPropertyName("nitrogen_dioxide")]
    public double? NitrogenDioxide { get; init; }

    [JsonPropertyName("sulphur_dioxide")]
    public double? SulphurDioxide { get; init; }

    [JsonPropertyName("ozone")]
    public double? Ozone { get; init; }
}
