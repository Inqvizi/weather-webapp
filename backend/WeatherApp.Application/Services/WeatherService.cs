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

    public async Task<WeatherResponseDto> GetCurrentWeatherByCoordinatesAsync(
        double latitude,
        double longitude,
        string? cityName = null,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        var weatherEntity = await weatherApiClient.GetCurrentWeatherByCoordinatesAsync(latitude, longitude, cityName, cancellationToken);
        return mapper.Map<WeatherResponseDto>(weatherEntity);
    }

    public async Task<ForecastResponseDto> GetForecastAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(cityName, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        var forecastData = await weatherApiClient.GetForecastAsync(cityName, cancellationToken);

        return new ForecastResponseDto
        {
            CityName = forecastData.City.Name,
            CountryCode = forecastData.City.CountryCode,
            Latitude = forecastData.City.Coordinates.Latitude,
            Longitude = forecastData.City.Coordinates.Longitude,
            Items = mapper.Map<IReadOnlyList<ForecastItemDto>>(forecastData.Hourly),
            Daily = forecastData.Daily,
            AirQuality = mapper.Map<AirQualityDto>(forecastData.AirQuality)
        };
    }

    public async Task<ForecastResponseDto> GetForecastByCoordinatesAsync(
        double latitude,
        double longitude,
        string? cityName = null,
        CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        var forecastData = await weatherApiClient.GetForecastByCoordinatesAsync(latitude, longitude, cityName, cancellationToken);

        return new ForecastResponseDto
        {
            CityName = forecastData.City.Name,
            CountryCode = forecastData.City.CountryCode,
            Latitude = forecastData.City.Coordinates.Latitude,
            Longitude = forecastData.City.Coordinates.Longitude,
            Items = mapper.Map<IReadOnlyList<ForecastItemDto>>(forecastData.Hourly),
            Daily = forecastData.Daily,
            AirQuality = mapper.Map<AirQualityDto>(forecastData.AirQuality)
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

    public async Task<AirQualityDto?> GetAirQualityAsync(string cityName, CancellationToken cancellationToken = default)
    {
        var validationResult = await validator.ValidateAsync(cityName, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.First().ErrorMessage);
        }

        var cities = await weatherApiClient.SearchCitiesAsync(cityName, null, cancellationToken);
        if (cities.Count == 0)
        {
            return null;
        }

        var firstCity = cities[0];
        return await GetAirQualityByCoordinatesAsync(firstCity.Coordinates.Latitude, firstCity.Coordinates.Longitude, cancellationToken);
    }

    public async Task<AirQualityDto?> GetAirQualityByCoordinatesAsync(double latitude, double longitude, CancellationToken cancellationToken = default)
    {
        ValidateCoordinates(latitude, longitude);

        var airQuality = await weatherApiClient.GetAirQualityByCoordinatesAsync(latitude, longitude, cancellationToken);
        return mapper.Map<AirQualityDto>(airQuality);
    }

    private static void ValidateCoordinates(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
        {
            throw new ValidationException("Latitude must be between -90 and 90 degrees");
        }

        if (longitude is < -180 or > 180)
        {
            throw new ValidationException("Longitude must be between -180 and 180 degrees");
        }
    }
}