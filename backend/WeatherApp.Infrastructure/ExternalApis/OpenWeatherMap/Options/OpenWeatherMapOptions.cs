namespace WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Options;

public sealed class OpenWeatherMapOptions
{
    public const string SectionName = "OpenWeatherMap";

    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.openweathermap.org/data/2.5/";
    public string Units { get; set; } = "metric";
    public string Language { get; set; } = "en";

}