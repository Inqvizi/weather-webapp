using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeatherApp.Application.Interfaces;
using WeatherApp.Infrastructure.ExternalApis.Caching;
using WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap;
using WeatherApp.Infrastructure.ExternalApis.OpenWeatherMap.Options;

namespace WeatherApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<OpenWeatherMapOptions>(configuration.GetSection(OpenWeatherMapOptions.SectionName));

        services.AddMemoryCache();

        services.AddHttpClient<OpenWeatherMapClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.openweathermap.org/data/2.5/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        services.AddScoped<IWeatherApiClient>(provider =>
        {
            var inner = provider.GetRequiredService<OpenWeatherMapClient>();
            var cache = provider.GetRequiredService<IMemoryCache>();

            return new CachedWeatherApiClient(inner, cache);
        });

        return services;
    }
}