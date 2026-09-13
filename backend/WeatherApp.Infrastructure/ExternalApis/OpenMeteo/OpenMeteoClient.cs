using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using WeatherApp.Application.Interfaces;
using WeatherApp.Domain.Entities;
using WeatherApp.Domain.Exceptions;
using WeatherApp.Domain.ValueObjects;
using WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Mappers;
using WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Models;
using WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Options;

namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo;

internal sealed class OpenMeteoClient : IWeatherApiClient
{
    private readonly HttpClient httpClient;
    private readonly OpenMeteoOptions options;
    private readonly IMemoryCache memoryCache;

    private static readonly TimeSpan GeocodingCacheDuration = TimeSpan.FromHours(24);

    public OpenMeteoClient(
        HttpClient httpClient,
        IOptions<OpenMeteoOptions> options,
        IMemoryCache memoryCache)
    {
        this.httpClient = httpClient;
        this.options = options.Value;
        this.memoryCache = memoryCache;
    }

    public async Task<IReadOnlyList<City>> SearchCitiesAsync(
        string query,
        string? language = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var lang = string.IsNullOrWhiteSpace(language) ? options.Language : language;
        var url = $"{options.GeocodingBaseUrl.TrimEnd('/')}/search?name={Uri.EscapeDataString(query.Trim())}&count={options.SearchCount}&language={lang}&format=json";

        try
        {
            var response = await httpClient.GetAsync(url, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return [];
            }

            response.EnsureSuccessStatusCode();

            var geoResponse = await response.Content.ReadFromJsonAsync<GeocodingResponse>(cancellationToken);
            if (geoResponse?.Results is null || geoResponse.Results.Count == 0)
            {
                return [];
            }

            return geoResponse.Results.Select(r => City.Create(
                r.Name,
                r.CountryCode,
                Coordinates.Create(r.Latitude, r.Longitude),
                r.Country,
                r.Admin1
            )).ToList();
        }
        catch (HttpRequestException ex)
        {
            throw new WeatherApiException($"Geocoding service communication error: {ex.Message}",
                (int)(ex.StatusCode ?? HttpStatusCode.BadGateway));
        }
    }

    public async Task<WeatherForecast> GetCurrentWeatherAsync(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var city = await ResolveCityAsync(cityName, cancellationToken);

        var forecastResponse = await FetchForecastAsync(city.Coordinates.Latitude, city.Coordinates.Longitude, cancellationToken);
        var current = forecastResponse.Current
                      ?? throw new WeatherApiException("Received empty current weather block from Open-Meteo", (int)HttpStatusCode.BadGateway);

        var isDay = current.IsDay == 1;
        var description = WmoWeatherCodeMapper.GetDescription(current.WeatherCode, options.Language);
        var iconCode = WmoWeatherCodeMapper.GetIconCode(current.WeatherCode, isDay);

        var measuredAt = DateTime.TryParse(current.Time, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate)
            ? DateTime.SpecifyKind(parsedDate, DateTimeKind.Unspecified)
            : DateTime.UtcNow;

        return WeatherForecast.Create(
            city,
            Temperature.FromCelsius(current.Temperature2m),
            Temperature.FromCelsius(current.ApparentTemperature),
            Math.Clamp(current.RelativeHumidity2m, 0, 100),
            Math.Max(0, current.WindSpeed10m),
            Math.Max(0, (int)Math.Round(current.SurfacePressure)),
            description,
            iconCode,
            measuredAt);
    }

    public async Task<IReadOnlyList<WeatherForecast>> GetForecastAsync(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var city = await ResolveCityAsync(cityName, cancellationToken);

        var forecastResponse = await FetchForecastAsync(city.Coordinates.Latitude, city.Coordinates.Longitude, cancellationToken);
        var hourly = forecastResponse.Hourly
                     ?? throw new WeatherApiException("Received empty hourly forecast block from Open-Meteo", (int)HttpStatusCode.BadGateway);

        var count = hourly.Time.Count;
        var forecasts = new List<WeatherForecast>(count);

        for (var i = 0; i < count; i++)
        {
            var timeStr = hourly.Time[i];
            var temp = i < hourly.Temperature2m.Count ? hourly.Temperature2m[i] : 0;
            var feels = i < hourly.ApparentTemperature.Count ? hourly.ApparentTemperature[i] : temp;
            var humidity = i < hourly.RelativeHumidity2m.Count ? hourly.RelativeHumidity2m[i] : 0;
            var wind = i < hourly.WindSpeed10m.Count ? hourly.WindSpeed10m[i] : 0;
            var pressure = i < hourly.SurfacePressure.Count ? (int)Math.Round(hourly.SurfacePressure[i]) : 0;
            var weatherCode = i < hourly.WeatherCode.Count ? hourly.WeatherCode[i] : 0;
            var isDay = i < hourly.IsDay.Count ? hourly.IsDay[i] == 1 : true;

            var description = WmoWeatherCodeMapper.GetDescription(weatherCode, options.Language);
            var iconCode = WmoWeatherCodeMapper.GetIconCode(weatherCode, isDay);

            var date = DateTime.TryParse(timeStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
                ? DateTime.SpecifyKind(parsed, DateTimeKind.Unspecified)
                : DateTime.UtcNow;

            forecasts.Add(WeatherForecast.Create(
                city,
                Temperature.FromCelsius(temp),
                Temperature.FromCelsius(feels),
                Math.Clamp(humidity, 0, 100),
                Math.Max(0, wind),
                Math.Max(0, pressure),
                description,
                iconCode,
                date));
        }

        return forecasts;
    }

    private async Task<City> ResolveCityAsync(string cityName, CancellationToken cancellationToken)
    {
        var cacheKey = $"openmeteo:city:{cityName.Trim().ToLowerInvariant()}:{options.Language}";
        if (memoryCache.TryGetValue(cacheKey, out City? cachedCity) && cachedCity is not null)
        {
            return cachedCity;
        }

        var results = await SearchCitiesAsync(cityName, options.Language, cancellationToken);
        if (results.Count == 0)
        {
            throw new CityNotFoundException(cityName);
        }

        var city = results[0];
        memoryCache.Set(cacheKey, city, GeocodingCacheDuration);
        return city;
    }

    private async Task<OpenMeteoForecastResponse> FetchForecastAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken)
    {
        var lat = latitude.ToString("F5", CultureInfo.InvariantCulture);
        var lon = longitude.ToString("F5", CultureInfo.InvariantCulture);

        var url = $"{options.WeatherBaseUrl.TrimEnd('/')}/forecast?latitude={lat}&longitude={lon}" +
                  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,is_day" +
                  "&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,is_day" +
                  "&timezone=auto";

        try
        {
            var response = await httpClient.GetAsync(url, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                throw new WeatherApiException("Weather forecast not found for coordinates", (int)HttpStatusCode.NotFound);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<OpenMeteoForecastResponse>(cancellationToken)
                   ?? throw new WeatherApiException("Received empty response body from Open-Meteo", (int)HttpStatusCode.BadGateway);
        }
        catch (HttpRequestException ex)
        {
            throw new WeatherApiException($"Open-Meteo forecast API error: {ex.Message}",
                (int)(ex.StatusCode ?? HttpStatusCode.BadGateway));
        }
    }
}
