using System.ComponentModel.DataAnnotations;
using WeatherApp.Application.DTOs;
using WeatherApp.Application.Interfaces;
using WeatherApp.Application.Validators;

namespace WeatherApp.Application.Services;

public class WeatherService : IWeatherService
{
    private readonly IWeatherApiClient weatherApiClient;
    private readonly CityNameValidator validator;

    public WeatherService(IWeatherApiClient weatherApiClient, CityNameValidator validator)
    {
        this.weatherApiClient = weatherApiClient;
        this.validator = new CityNameValidator();
    }

    public async Task<WeatherResponseDto> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(cityName, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        return await weatherApiClient.GetCurrentWeatherAsync(cityName, cancellationToken);
    }

    public async Task<ForecastResponseDto> GetForecastAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(cityName, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        var items = await weatherApiClient.GetForecastAsync(cityName, cancellationToken);

        return new ForecastResponseDto()
        {
            CityName = cityName,
            Items = items,
        };
    }
}