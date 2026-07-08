using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using WeatherApp.Application.Interfaces;
using WeatherApp.Domain.Entities;
using WeatherApp.Domain.Exceptions;
using WeatherApp.Domain.ValueObjects;
using WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Models;
using WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Options;

namespace WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap;

internal sealed class OpenWeatherMapClient : IWeatherApiClient
{
    private readonly HttpClient httpClient;
    private readonly OpenWeatherMapOptions options;

    public OpenWeatherMapClient(HttpClient httpClient, IOptions<OpenWeatherMapOptions> options)
    {
        this.httpClient = httpClient;
        this.options = options.Value;
    }

    public async Task<WeatherForecast> GetCurrentWeatherAsync(string cityName,
        CancellationToken cancellationToken = default)
    {
        var url = BuildUrl("weather", cityName);

        var response = await httpClient.GetAsync(url, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new CityNotFoundException(cityName);
        }

        response.EnsureSuccessStatusCode();

        var raw = await response.Content.ReadFromJsonAsync<OWMCurrentWeatherResponse>(cancellationToken)
                  ?? throw new WeatherApiException("Received empty response from API", 200);

        var city = City.Create(
            raw.CityName,
            raw.Sys.Country,
            Coordinates.Create(raw.Coord.Lat, raw.Coord.Lon));

        return WeatherForecast.Create(
            city,
            Temperature.FromCelsius(raw.Main.Temp),
            Temperature.FromCelsius(raw.Main.FeelsLike),
            raw.Main.Humidity,
            raw.Wind.Speed,
            raw.Main.Pressure,
            raw.Weather.FirstOrDefault()?.Description ?? string.Empty,
            raw.Weather.FirstOrDefault()?.Icon ?? string.Empty,
            DateTimeOffset.FromUnixTimeSeconds(raw.Timestamp).UtcDateTime);
    }

    public async Task<IReadOnlyList<WeatherForecast>> GetForecastAsync(string cityName,
        CancellationToken cancellationToken = default)
    {
        var url = BuildUrl("forecast", cityName);
        var response = await httpClient.GetAsync(url, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new CityNotFoundException(cityName);
        }

        response.EnsureSuccessStatusCode();

        var raw = await response.Content.ReadFromJsonAsync<OWMForecastResponse>(cancellationToken)
                  ?? throw new WeatherApiException("Received empty response from API", 200);

        var city = City.Create(
            raw.City.Name,
            raw.City.Country,
            Coordinates.Create(0, 0));

        return raw.List.Select(item => WeatherForecast.Create(
            city,
            Temperature.FromCelsius(item.Main.Temp),
            Temperature.FromCelsius(item.Main.FeelsLike),
            item.Main.Humidity,
            item.Wind.Speed,
            item.Main.Pressure,
            item.Weather.FirstOrDefault()?.Description ?? string.Empty,
            item.Weather.FirstOrDefault()?.Icon ?? string.Empty,
            DateTimeOffset.FromUnixTimeSeconds(item.Timestamp).UtcDateTime)
        ).ToList();
    }

    private string BuildUrl(string endpoint, string cityName) =>
        $"{endpoint}?q={Uri.EscapeDataString(cityName)}&appid={options.ApiKey}&units={options.Units}&lang={options.Language}";
}