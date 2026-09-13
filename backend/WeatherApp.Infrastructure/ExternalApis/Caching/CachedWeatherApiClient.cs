using Microsoft.Extensions.Caching.Memory;
using WeatherApp.Application.Interfaces;
using WeatherApp.Domain.Entities;

namespace WeatherApp.Infrastructure.ExternalApis.Caching;

internal sealed class CachedWeatherApiClient : IWeatherApiClient
{
    private readonly IWeatherApiClient inner;
    private readonly IMemoryCache cache;

    private static readonly TimeSpan CurrentWeatherCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan ForecastCacheDuration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan CitiesSearchCacheDuration = TimeSpan.FromHours(24);

    public CachedWeatherApiClient(IWeatherApiClient inner, IMemoryCache cache)
    {
        this.inner = inner;
        this.cache = cache;
    }

    public async Task<WeatherForecast> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"weather:{cityName.ToLowerInvariant()}";
        if (cache.TryGetValue(cacheKey, out WeatherForecast? cached) && cached is not null)
        {
            return cached;
        }

        var result = await inner.GetCurrentWeatherAsync(cityName, cancellationToken);
        cache.Set(cacheKey, result, CurrentWeatherCacheDuration);
        return result;
    }

    public async Task<IReadOnlyList<WeatherForecast>> GetForecastAsync(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"forecast:{cityName.ToLowerInvariant()}";
        if (cache.TryGetValue(cacheKey, out IReadOnlyList<WeatherForecast>? cached) && cached is not null)
        {
            return cached;
        }

        var result = await inner.GetForecastAsync(cityName, cancellationToken);
        cache.Set(cacheKey, result, ForecastCacheDuration);
        return result;
    }

    public async Task<IReadOnlyList<City>> SearchCitiesAsync(
        string query,
        string? language = null,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"cities:{query.ToLowerInvariant()}:{language ?? "default"}";
        if (cache.TryGetValue(cacheKey, out IReadOnlyList<City>? cached) && cached is not null)
        {
            return cached;
        }

        var result = await inner.SearchCitiesAsync(query, language, cancellationToken);
        cache.Set(cacheKey, result, CitiesSearchCacheDuration);
        return result;
    }
}