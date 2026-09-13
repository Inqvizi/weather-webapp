namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Options;

public sealed class OpenMeteoOptions
{
    public const string SectionName = "OpenMeteo";

    public string GeocodingBaseUrl { get; set; } = "https://geocoding-api.open-meteo.com/v1/";
    public string WeatherBaseUrl { get; set; } = "https://api.open-meteo.com/v1/";
    public string Language { get; set; } = "uk";
    public int SearchCount { get; set; } = 5;
}
