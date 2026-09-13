using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using WeatherApp.Application.DTOs;
using WeatherApp.Application.Interfaces;
using WeatherApp.Application.Models;
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
        return await GetCurrentWeatherForCityAsync(city, cancellationToken);
    }

    public async Task<WeatherForecast> GetCurrentWeatherByCoordinatesAsync(
        double latitude,
        double longitude,
        string? cityName = null,
        CancellationToken cancellationToken = default)
    {
        var resolvedName = string.IsNullOrWhiteSpace(cityName) ? "Current Location" : cityName.Trim();
        var city = City.Create(resolvedName, string.Empty, Coordinates.Create(latitude, longitude));
        return await GetCurrentWeatherForCityAsync(city, cancellationToken);
    }

    public async Task<ForecastData> GetForecastAsync(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var city = await ResolveCityAsync(cityName, cancellationToken);
        return await GetForecastForCityAsync(city, cancellationToken);
    }

    public async Task<ForecastData> GetForecastByCoordinatesAsync(
        double latitude,
        double longitude,
        string? cityName = null,
        CancellationToken cancellationToken = default)
    {
        var resolvedName = string.IsNullOrWhiteSpace(cityName) ? "Current Location" : cityName.Trim();
        var city = City.Create(resolvedName, string.Empty, Coordinates.Create(latitude, longitude));
        return await GetForecastForCityAsync(city, cancellationToken);
    }

    private async Task<WeatherForecast> GetCurrentWeatherForCityAsync(
        City city,
        CancellationToken cancellationToken)
    {
        var forecastResponse = await FetchForecastAsync(city.Coordinates.Latitude, city.Coordinates.Longitude, cancellationToken);
        var current = forecastResponse.Current
                      ?? throw new WeatherApiException("Received empty current weather block from Open-Meteo", (int)HttpStatusCode.BadGateway);

        var isDay = current.IsDay == 1;
        var description = WmoWeatherCodeMapper.GetDescription(current.WeatherCode, options.Language);
        var iconCode = WmoWeatherCodeMapper.GetIconCode(current.WeatherCode, isDay);

        var measuredAt = DateTime.TryParse(current.Time, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate)
            ? DateTime.SpecifyKind(parsedDate, DateTimeKind.Unspecified)
            : DateTime.UtcNow;

        var sunrise = string.Empty;
        var sunset = string.Empty;
        var uvIndex = 0.0;

        if (forecastResponse.Daily is not null && forecastResponse.Daily.Time.Count > 0)
        {
            sunrise = forecastResponse.Daily.Sunrise.Count > 0 ? forecastResponse.Daily.Sunrise[0] : string.Empty;
            sunset = forecastResponse.Daily.Sunset.Count > 0 ? forecastResponse.Daily.Sunset[0] : string.Empty;
            uvIndex = forecastResponse.Daily.UvIndexMax.Count > 0 ? forecastResponse.Daily.UvIndexMax[0] : 0.0;
        }

        return WeatherForecast.Create(
            city,
            Temperature.FromCelsius(current.Temperature2m),
            Temperature.FromCelsius(current.ApparentTemperature),
            Math.Clamp(current.RelativeHumidity2m, 0, 100),
            Math.Max(0, current.WindSpeed10m),
            Math.Max(0, (int)Math.Round(current.SurfacePressure)),
            description,
            iconCode,
            measuredAt,
            windDirection: current.WindDirection10m,
            precipitationProbability: 0,
            uvIndex: uvIndex,
            sunrise: sunrise,
            sunset: sunset,
            isDay: isDay,
            weatherCode: current.WeatherCode);
    }

    private async Task<ForecastData> GetForecastForCityAsync(
        City city,
        CancellationToken cancellationToken)
    {
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
            var windDir = i < hourly.WindDirection10m.Count ? hourly.WindDirection10m[i] : 0;
            var pressure = i < hourly.SurfacePressure.Count ? (int)Math.Round(hourly.SurfacePressure[i]) : 0;
            var precipProb = i < hourly.PrecipitationProbability.Count ? hourly.PrecipitationProbability[i] : 0;
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
                date,
                windDirection: windDir,
                precipitationProbability: precipProb,
                uvIndex: 0,
                sunrise: string.Empty,
                sunset: string.Empty,
                isDay: isDay,
                weatherCode: weatherCode));
        }

        var dailyList = new List<DailyForecastItemDto>();
        if (forecastResponse.Daily is not null)
        {
            var dailyCount = forecastResponse.Daily.Time.Count;
            for (var i = 0; i < dailyCount; i++)
            {
                var dateStr = forecastResponse.Daily.Time[i];
                var rawCode = i < forecastResponse.Daily.WeatherCode.Count ? forecastResponse.Daily.WeatherCode[i] : 0;
                var code = ResolveDailyWeatherCode(dateStr, rawCode, forecastResponse.Hourly);
                var minTemp = i < forecastResponse.Daily.Temperature2mMin.Count ? forecastResponse.Daily.Temperature2mMin[i] : 0.0;
                var maxTemp = i < forecastResponse.Daily.Temperature2mMax.Count ? forecastResponse.Daily.Temperature2mMax[i] : 0.0;
                var sunrise = i < forecastResponse.Daily.Sunrise.Count ? forecastResponse.Daily.Sunrise[i] : string.Empty;
                var sunset = i < forecastResponse.Daily.Sunset.Count ? forecastResponse.Daily.Sunset[i] : string.Empty;
                var uvMax = i < forecastResponse.Daily.UvIndexMax.Count ? forecastResponse.Daily.UvIndexMax[i] : 0.0;

                dailyList.Add(new DailyForecastItemDto
                {
                    Date = dateStr,
                    WeatherCode = code,
                    Description = WmoWeatherCodeMapper.GetDescription(code, options.Language),
                    IconCode = WmoWeatherCodeMapper.GetIconCode(code, true),
                    MinTemp = minTemp,
                    MaxTemp = maxTemp,
                    Sunrise = sunrise,
                    Sunset = sunset,
                    UvIndexMax = uvMax
                });
            }
        }

        return new ForecastData(city, forecasts, dailyList);
    }

    private static int ResolveDailyWeatherCode(
        string dateStr,
        int rawDailyCode,
        HourlyWeatherBlock? hourly)
    {
        if (hourly is null || hourly.Time.Count == 0)
        {
            return rawDailyCode;
        }

        var dayIndices = new List<int>();
        for (var i = 0; i < hourly.Time.Count; i++)
        {
            if (hourly.Time[i].StartsWith(dateStr, StringComparison.OrdinalIgnoreCase))
            {
                dayIndices.Add(i);
            }
        }

        if (dayIndices.Count == 0)
        {
            return rawDailyCode;
        }

        // Identify daylight hours (is_day == 1)
        var daylightIndices = dayIndices
            .Where(idx => idx < hourly.IsDay.Count && hourly.IsDay[idx] == 1)
            .ToList();

        // Fallback to core daytime hours (08:00 to 19:00) if is_day flags are missing
        if (daylightIndices.Count == 0)
        {
            daylightIndices = dayIndices.Where(idx =>
            {
                var time = hourly.Time[idx];
                if (DateTime.TryParse(time, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                {
                    return dt.Hour >= 8 && dt.Hour <= 19;
                }
                return true;
            }).ToList();
        }

        var sampleIndices = daylightIndices.Count > 0 ? daylightIndices : dayIndices;

        // 1. Check for severe storms, snow or precipitation during daylight
        var daylightCodes = sampleIndices
            .Select(idx => idx < hourly.WeatherCode.Count ? hourly.WeatherCode[idx] : 0)
            .ToList();

        var precipitationCodes = daylightCodes
            .Where(c => (c >= 51 && c <= 67) || (c >= 71 && c <= 86) || (c >= 95 && c <= 99))
            .ToList();

        // If severe storm or snow occurs during daytime, always prioritize it
        var severeCode = precipitationCodes.FirstOrDefault(c => c >= 95 || (c >= 71 && c <= 77) || c == 65 || c == 82);
        if (severeCode > 0)
        {
            return severeCode;
        }

        // If rain or drizzle occurs for at least 2 daylight hours, report it
        if (precipitationCodes.Count >= 2)
        {
            return precipitationCodes
                .GroupBy(c => c)
                .OrderByDescending(g => g.Count())
                .First().Key;
        }

        // 2. Evaluate cloudiness vs sunshine during daytime
        var clearCount = daylightCodes.Count(c => c == 0);
        var mainlyClearCount = daylightCodes.Count(c => c == 1);
        var partlyCloudyCount = daylightCodes.Count(c => c == 2);
        var overcastCount = daylightCodes.Count(c => c == 3);
        var fogCount = daylightCodes.Count(c => c == 45 || c == 48);

        var totalDaylight = daylightCodes.Count;
        var sunHours = clearCount + mainlyClearCount + partlyCloudyCount;

        // If the sun shines for a significant portion of daylight (> 40%), don't brand the whole day as Overcast!
        if (sunHours >= overcastCount || overcastCount < totalDaylight * 0.6)
        {
            if (clearCount >= partlyCloudyCount && clearCount >= mainlyClearCount && clearCount >= totalDaylight * 0.35)
            {
                return 0; // Clear sky (Sunny)
            }

            if ((clearCount + mainlyClearCount) >= partlyCloudyCount && (clearCount + mainlyClearCount) >= totalDaylight * 0.35)
            {
                return 1; // Mainly clear
            }

            return 2; // Partly cloudy (Sun with clouds)
        }

        if (fogCount >= totalDaylight * 0.5)
        {
            return 45; // Fog
        }

        // True overcast day (overcast for >= 60% of daylight)
        return 3;
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
                  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m" +
                  "&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,is_day" +
                  "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max" +
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
