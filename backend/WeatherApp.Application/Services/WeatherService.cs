using System.ComponentModel.DataAnnotations;
using AutoMapper;
using WeatherApp.Application.DTOs;
using WeatherApp.Application.Interfaces;
using WeatherApp.Application.Validators;

namespace WeatherApp.Application.Services;

public class WeatherService : IWeatherService
{
    private readonly IWeatherApiClient weatherApiClient;
    private readonly IMapper mapper;
    private readonly CityNameValidator validator;

    public WeatherService(IWeatherApiClient weatherApiClient, IMapper mapper, CityNameValidator validator)
    {
        this.weatherApiClient = weatherApiClient;
        this.mapper = mapper;
        this.validator = validator;
    }

    public async Task<WeatherResponseDto> GetCurrentWeatherAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(cityName, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        var weatherEntity = await weatherApiClient.GetCurrentWeatherAsync(cityName, cancellationToken);
        return mapper.Map<WeatherResponseDto>(weatherEntity);
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
            CityName = items.FirstOrDefault()?.City.Name ?? cityName,
            CountryCode = items.FirstOrDefault()?.City.CountryCode ?? string.Empty,
            Items = mapper.Map<IReadOnlyList<ForecastItemDto>>(items),
        };
    }

    public async Task<IReadOnlyList<CitySearchResultDto>> SearchCitiesAsync(string query, string? language = null, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        var cities = await weatherApiClient.SearchCitiesAsync(query, language, cancellationToken);
        return mapper.Map<IReadOnlyList<CitySearchResultDto>>(cities);
    }
}