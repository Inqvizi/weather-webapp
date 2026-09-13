using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeatherApp.Application.Interfaces;
using WeatherApp.Infrastructure.ExternalApis.Caching;
using WeatherApp.Infrastructure.ExternalApis.OpenMeteo;
using WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Options;

namespace WeatherApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<OpenMeteoOptions>(configuration.GetSection(OpenMeteoOptions.SectionName));

        services.AddMemoryCache();

        services.AddHttpClient<OpenMeteoClient>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.Add("User-Agent", "WeatherWebApp/1.0 (https://github.com)");
        });

        services.AddScoped<IWeatherApiClient>(provider =>
        {
            var inner = provider.GetRequiredService<OpenMeteoClient>();
            var cache = provider.GetRequiredService<IMemoryCache>();

            return new CachedWeatherApiClient(inner, cache);
        });

        return services;
    }
}